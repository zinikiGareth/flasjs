FlasckWrapper = function(postbox, initSvc, cardClz) {
	this._ctor = 'FlasckWrapper';
	this.postbox = postbox;
	this.initSvc = initSvc;
	this.cardClz = cardClz;
	this.ctrmap = {};
	this.nodeCache = {};
	this.cardCache = {};
	this.card = null; // will be filled in later
	this.div = null;
	return this;
}

FlasckWrapper.Processor = function(wrapper, service) {
	if (!service)
		throw new Error("No service was defined");
	this.wrapper = wrapper;
	this.service = service;
}

FlasckWrapper.Processor.prototype.process = function(message) {
//	console.log("received message", message);
	var meth = this.service[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
//	message.args.splice(0, 0, message.from);
	var clos = meth.apply(this.service, message.args);
//console.log("clos = ", clos);
	var msgs = FLEval.full(clos);
	var todo = this.wrapper.processMessages(msgs);
	this.wrapper.updateDisplay(todo);
}

FlasckWrapper.prototype.cardCreated = function(card) {
	var self = this;
	this.card = card;
	this.services = {};
	for (var svc in card._services) {
		var svcAddr = this.postbox.newAddress();
		this.postbox.register(svcAddr, new FlasckWrapper.Processor(this, card._services[svc]));
		this.services[svc] = this.postbox.unique(svcAddr);
	}
	var userInit;
	var contracts = {};
	for (var ctr in card._contracts) {
		contracts[ctr] = new FlasckWrapper.Processor(this, card._contracts[ctr]);
		if (ctr === 'org.ziniki.Init')
			userInit = contracts[ctr];
	}
	// THIS MAY OR MAY NOT BE A HACK
	contracts['org.ziniki.Init'] = {
		process: function(message) {
			"use strict";
			if (message.method === 'services')
				this.services(message.from, message.args[0]);
			else if (message.method === 'state')
				this.state(message.from, message.args[0]);
			else
				throw new Error("Cannot process " + message.method);
		},
		services: function(from, serviceMap) {
			"use strict";
			for (var ctr in serviceMap) {
				self.services[ctr] = serviceMap[ctr];
				if (card._contracts[ctr])
					card._contracts[ctr]._addr = serviceMap[ctr];
			}
		},
		state: function(from) {
			"use strict";
//			console.log("Setting state");
			// OK ... I claim it's ready now
			if (userInit) {
				userInit.process({from: from, method: 'onready', args: []});
			}
		},
		service: {} // to store _myaddr
	}
	contracts['org.ziniki.Render'] = {
		process: function(message) {
			"use strict";
			if (message.method === 'render')
				this.render(message.from, message.args[0]);
			else
				throw new Error("Cannot process " + message.method);
		},
		render: function(from, opts) {
			"use strict";
			if (self.card._initialRender) {
				self.infoAbout = {};
				self.div = opts.into; // not sure if we really need this
				self.card._initialRender.call(self.card, self.div.ownerDocument, self, self.div);
			}
		},
		service: {} // to store _myaddr
	}
	// END HACK
	for (var ctr in contracts) {
		var ctrAddr = this.postbox.newAddress();
		this.postbox.register(ctrAddr, contracts[ctr]);
		this.ctrmap[ctr] = this.postbox.unique(ctrAddr);
		contracts[ctr].service._myaddr = this.postbox.unique(ctrAddr);
	}
	this.postbox.deliver(this.initSvc, {from: this.ctrmap['org.ziniki.Init'], method: "ready", args:[this.ctrmap]});
}

FlasckWrapper.prototype.dispatchEvent = function(ev, handler) {
  var msgs = FLEval.full(new FLClosure(this.card, handler, [ev]));
  var todo = this.processMessages(msgs);
  this.updateDisplay(todo);
}

FlasckWrapper.prototype.processMessages = function(l) {
	var todo = {};
	while (l && l._ctor === 'Cons') {
		this.processOne(todo, l.head);
		l = l.tail;
	}
	return todo;
}

FlasckWrapper.prototype.processOne = function(todo, msg) {
//	console.log("Message: ", msg);
	if (msg._ctor === 'Send') {
		var target = FLEval.head(this.card[msg.target]);
		this.card[msg.target] = target;
		if (!target._special) {
			console.log("Target for send is not 'special'", msg.target);
			return;
		}
		var meth = msg.method;
		var args = FLEval.flattenList(msg.args);
		console.log("trying to send", meth, args);
		if (target._special === 'contract') {
			var addr = target._addr;
			if (!addr) {
				console.log("No service was provided for " + target._contract);
				return;
			}
			// convert "handlers" to local postbox addresses
			for (var p=0;p<args.length;p++) {
				var a = args[p];
				if (a._special) {
					if (!a._onchan) {
						if (a._special === 'handler') {
							var proxy = new FlasckWrapper.Processor(this, a);
							var ha = this.postbox.newAddress();
							this.postbox.register(ha, proxy);
							a._myaddr = this.postbox.unique(ha);
						} else
							throw new Error("Cannot send an object of type " + a._special);
					}
					args[p] = { type: a._special, chan: a._myaddr };
				}
			}
			this.postbox.deliver(addr, {from: target._myaddr, method: meth, args: args });
		} else if (target._special === 'object') {
			var actM = target[meth];
			if (!actM) {
				console.log("There is no method " + m + " on ", target);
				return;
			}
			var newmsgs = actM.apply(target, args);
			if (!todo[msg.target])
				todo[msg.target] = {};
			if (!todo[msg.target]['itemInserted'])
				todo[msg.target]['itemInserted'] = [];
			todo[msg.target]['itemInserted'].push(args[1]);
			if (!todo[msg.target]['itemChanged'])
				todo[msg.target]['itemChanged'] = [];
			todo[msg.target]['itemChanged'].push(args[1]);
			// TODO: theoretically at least, objects can spit out more TODO items
			// we need to collect these and put them on one big giant list
			// and then keep calling "setTimeout(0)" at the end here to process that list after this one
			// until we reach a stable state where no more items are generated
			if (newmsgs)
				console.log("object invocation returns closure ", newmsgs);
		} else {
			console.log("Cannot handle special case:", target._special);
			return;
		}
	} else if (msg._ctor === 'Assign') {
		this.card[msg.field] = msg.value;
		if (!todo[msg.field])
			todo[msg.field] = {};
		todo[msg.field]['assign'] = true; 
	} else
		throw new Error("The method message " + msg._ctor + " is not supported");
}

var nextid = 1; // TODO: this might actually be the right scoping; what I want is for it global per document.  On the other hand, I would prefer it to be somewhere that looked logical
FlasckWrapper.prototype.nextSlotId = function() {
	return 'slot_' + nextid++;
}

FlasckWrapper.prototype.updateDisplay = function(todo) {
	if (!this.div)
		return; // need to set up render contract first
	var updateTree = this.cardClz.onUpdate;
	if (!updateTree)
		return;
	var doc = this.div.ownerDocument;
	for (var target in todo) {
		var actions = todo[target];
		if (actions['itemInserted']) {
			// TODO: we need "before" somewhere, so this should probably be map value -> before
			for (var j=0;j<actions['itemInserted'].length;j++) {
				var v = actions['itemInserted'][j];
				for (var i=0;i<updateTree[target]['itemInserted'].length;i++)
					updateTree[target]['itemInserted'][i].call(this.card, doc, this, v, null);
			}
		}
		if (actions['itemChanged']) {
			for (var j=0;j<actions['itemChanged'].length;j++) {
				var v = actions['itemInserted'][j];
				for (var i=0;i<updateTree[target]['itemChanged'].length;i++)
					updateTree[target]['itemChanged'][i].call(this.card, doc, this, v);
			}
		}
		if (actions['assign']) {
			var ut = updateTree[target];
			if (ut && ut['assign']) {
				for (var i=0;i<ut['assign'].length;i++) { 
					ut['assign'][i].call(this.card, this.div.ownerDocument, this);
				}
			}
		}
	}
}

FlasckWrapper.prototype.showCard = function(slot, cardOpts) {
	var div = doc.getElementById(this.infoAbout[slot]);
	if (this.cardCache[slot]) {
   		this.cardCache[slot].redrawInto(div);
	} else {
  		var svcs = cardOpts.services;
  		if (!svcs || svcs._ctor === 'Nil')
	  		svcs = this.services;
  		var innerCard = Flasck.createCard(this.postbox, div, { explicit: cardOpts.card }, svcs);
  		this.cardCache[slot] = innerCard;
	}
}

function d3attrFn(card, flfn) {
    return function(d, i) {
        var elt = { _ctor: 'D3Element', data: d, idx: i }
        return FLEval.full(flfn.call(card, elt));
    }
}

FlasckWrapper.prototype.updateD3 = function(slot, info) { // TODO: other args
	info = FLEval.full(info);
	// info is an assoc of key -> value
	// info.data is a function returning the list of data items (of any type; that's up to the user code to sort out)
    var mydata = FLEval.flattenList(info.assoc("data").call(this.card));
    
    // info.enter is a list of zero-or-more 'enter' methods on the card each of which is () -> [D3Action] 
    var enter = info.assoc("enter");
    var cmds = [];
    while (enter._ctor === 'Cons') {
        var a = enter.head;
        var v = FLEval.full(a.apply(this.card));
        cmds.push({ select: v.head.args.head, insert: v.head.args.head });
        enter = enter.tail;
    }
    
    // info.layout is a list of zero-or-more layouts on the card, each of which is a pair of (pattern, [prop]) where each prop is a pair (name, value-or-function)
    var layout = info.assoc("layout");
	var svg = doc.getElementById(slot);
    for (var c in cmds)
        d3.select(svg).selectAll(cmds[c].select).data(mydata).enter().append(cmds[c].insert);
    while (layout._ctor === 'Cons') {
        var mine = layout.head;
        var patt = mine.members[0];
        var props = mine.members[1];
        var actOn = d3.select(svg).selectAll(patt);
        while (props._ctor === 'Cons') {
                            var ph = props.head;
                            var attr = ph.members[0];
                            if (attr === 'text')
                                    actOn = actOn.text(d3attrFn(this.card, ph.members[1]));
                            else {
                                    if (attr === 'textAnchor')
                                            attr = 'text-anchor';
                                    else if (attr === 'fontFamily')
                                            attr = 'font-family';
                                    else if (attr === 'fontSize')
                                            attr = 'font-size';
                                    actOn = actOn.attr(attr, d3attrFn(this.card, ph.members[1]));
                            }
                            props = props.tail;
        }
        layout = layout.tail;
    }
}