FlasckWrapper = function(postbox, initSvc, cardClz, inside) {
	this._ctor = 'FlasckWrapper';
	this.postbox = postbox;
	this.initSvc = initSvc;
	this.cardClz = cardClz;
	this.ctrmap = {};
	this.nodeCache = {};
	this.cardCache = {};
	this.card = null; // will be filled in later
	this.div = inside;
	return this;
}

FlasckWrapper.Processor = function(wrapper, service) {
	if (!service)
		throw new Error("No service was defined");
	this.wrapper = wrapper;
	if (service._ctor === "net.ziniki.perspocpoc.EditProfile.BlockHandler") {
		var hack = {
			update: function(type, obj) {
				return service.update.apply(service, [FLEval.inflateType(type, obj)]);
			}
		}
		this.service = hack;
		return;
	}
	this.service = service;
}

FlasckWrapper.Processor.prototype.process = function(message) {
	console.log("received message", message);
	var meth = this.service[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
//	var args = [];
//	for (var k=0;k<message.args.length;k++) {
//		args[k] = FLEval.inflate(message.args[k]);
//	}
	var clos = meth.apply(this.service, message.args);
	if (clos) {
//console.log("clos = ", clos);
		var msgs = FLEval.full(clos);
		var todo = this.wrapper.processMessages(msgs);
		this.wrapper.updateDisplay(todo);
	}
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
	var kvupdate;
	var contracts = {};
	for (var ctr in card._contracts) {
		contracts[ctr] = new FlasckWrapper.Processor(this, card._contracts[ctr]);
		if (ctr === 'org.ziniki.Init')
			userInit = contracts[ctr];
		else if (ctr === 'net.ziniki.perspocpoc.KVUpdate')
			kvupdate = contracts[ctr];
	}
	// THIS MAY OR MAY NOT BE A HACK
	contracts['org.ziniki.Init'] = {
		process: function(message) {
			"use strict";
			if (message.method === 'services')
				this.services(message.from, message.args[0]);
			else if (message.method === 'state')
				this.state(message.from, message.args[0]);
			else if (message.method === 'loadId')
				this.loadId(message.from, message.args[0]);
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
			if (userInit && userInit.service.onready) {
				userInit.process({from: from, method: 'onready', args: []});
			}
		},
		loadId: function(from, id) {
			var uf = function(type, obj) {
				if (userInit && userInit.service.update)
					userInit.process({from: from, method: 'update', args: [FLEval.inflateType(type, obj)]});
				else
					console.log("there is no update method to handle", id, type, obj);
			};
			if (self.services['org.ziniki.KeyValue']) {
				var proxy = new FlasckWrapper.Processor(self, { update: uf });
				var ha = self.postbox.newAddress();
				self.postbox.register(ha, proxy);
				var handler = { type: 'handler', chan: self.postbox.unique(ha) };
				self.postbox.deliver(self.services['org.ziniki.KeyValue'], {from: self.ctrmap['org.ziniki.Init'], method: 'subscribe', args:[id, handler] });
			}
		},
		service: {} // to store _myaddr
	}
	contracts['net.ziniki.perspocpoc.KVUpdate'] = {
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
			if (!self.card._initialRender)
				console.log("There is no method _initialRender on ", self.card);
			else {
				self.infoAbout = {};
				if (opts.into)
					self.div = opts.into;
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
	this.postbox.deliver(this.initSvc, {from: this.ctrmap['org.ziniki.Init'], method: 'ready', args:[this.ctrmap]});
}

FlasckWrapper.prototype.dispatchEvent = function(ev, handler) {
  var msgs = FLEval.full(new FLClosure(this.card, handler, [ev]));
  var todo = this.processMessages(msgs);
  this.updateDisplay(todo);
}

FlasckWrapper.prototype.processMessages = function(l) {
	var todo = {};
	while (l && l._ctor === 'Cons') {
		console.log(l.head);
		if (l.head._ctor === 'Nil')
			;
		else if (l.head._ctor === 'Cons')
			this.processMessages(l.head);
		else
			this.processOne(todo, l.head);
		l = l.tail;
	}
	return todo;
}

FlasckWrapper.prototype.processOne = function(todo, msg) {
//	console.log("Message: ", msg);
	if (msg._ctor === 'Send') {
		var target = msg.target;
		if (typeof target === 'string') {
			target = FLEval.head(this.card[msg.target]);
			// this.card[msg.target] = target; // this was here, but why?
		}
		if (!target._special) {
			console.log("Target for send is not 'special'", msg.target);
			return;
		}
		var meth = msg.method;
		var args = FLEval.flattenList(msg.args);
//		console.log("trying to send", meth, args);
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
				debugger;
				console.log("There is no method " + meth + " on ", target);
				return;
			}
			var newmsgs = actM.apply(target, args);
			
			// This is admittedly a hack; we need to consider all the cases, really.  I don't quite know how.
			if (!todo[msg.target])
				todo[msg.target] = {};
			todo[msg.target]['assign'] = true;
			
			/* This was a previous hack ...
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
			*/
		} else {
			console.log("Cannot handle special case:", target._special);
			return;
		}
	} else if (msg._ctor === 'Assign') {
		this.card[msg.field] = msg.value;
		if (!todo[msg.field])
			todo[msg.field] = {};
		todo[msg.field]['assign'] = true;
	} else if (msg._ctor === 'CreateCard') {
		// If the user requests that we make a new card in response to some action, we need to know where to place it
		// The way we fundamentally know this is to look at the "where" option
		var where = msg.options.assoc("where");
		if (!where)
			throw new Error("Can't display a card nowhere");
		else if (where === 'overlay') {
			// HACK: because showCard automatically pulls the div#id out of infoAbout, we need to put it in.
			// I think we should probably change that, or else have two methods
			this.infoAbout['flasck_popover_div'] = 'flasck_popover_div';
			this.showCard('flasck_popover_div', { card: msg.card });
			this.div.ownerDocument.getElementById('flasck_popover').showModal();
		} else
			throw new Error("Cannot yet place a card " + where);
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
			// TODO: we need "before" somewhere, so this should probably be map value -> before, or else map key -> value so we can find the before
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
					ut['assign'][i].call(this.card, doc, this);
				}
			}
		}
	}
}

FlasckWrapper.prototype.showCard = function(slot, cardOpts) {
	var mode = cardOpts.mode || 'local';
	var div = doc.getElementById(this.infoAbout[slot]);
	div.innerHTML = '';
	if (this.cardCache[slot]) {
   		this.cardCache[slot].redrawInto(div);
	} else {
  		var svcs = cardOpts.services;
  		if (!svcs || svcs._ctor === 'Nil')
	  		svcs = this.services;
  		var innerCard = Flasck.createCard(this.postbox, div, { mode: mode, explicit: cardOpts.card }, svcs);
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