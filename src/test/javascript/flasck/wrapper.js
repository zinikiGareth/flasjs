FlasckWrapper = function(postbox, initSvc, cardClz, inside) {
	this._ctor = 'FlasckWrapper';
	this.postbox = postbox;
	this.initSvc = initSvc;
	this.cardClz = cardClz;
	this.ctrmap = {};
	this.nodeCache = {};
	this.cardCache = {};
	this.card = null; // will be filled in later
	this.ports = [];
	this.div = inside;
	this.updateAreas = [];
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
	"use strict"
//	console.log("received message", message);
	var meth = this.service[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	var clos = meth.apply(this.service, message.args);
	if (clos) {
		this.wrapper.messageEventLoop(FLEval.full(clos));
	}
}

FlasckWrapper.prototype.editField = function(ev, elt, rules, inside) {
	var self = this;
	var doc = elt.ownerDocument;
	var ct = elt.childNodes[0].wholeText; // should just be text, I think ...
	elt.innerHTML = '';
	var input = doc.createElement("input");
	input.setAttribute("type", "text");
	input.value = ct;
	input.select();
	input.onblur = function(ev) { self.saveField(ev, elt, rules, null, inside); }
	input.onkeyup = function(ev) { if (ev.keyCode == 13) { input.blur(); /* self.saveField(ev, elt, rules, null, inside); */ return false;} }
	input.onkeydown = function(ev) { if (ev.keyCode == 27) { self.saveField(ev, elt, rules, ct, inside); return false; } }
	elt.appendChild(input); 
	input.focus(); 
	elt.onclick = null;
}

FlasckWrapper.prototype.saveField = function(ev, elt, rules, revertTo, inside) {
	var self = this;
	var doc = elt.ownerDocument;
	var input = revertTo || elt.children[0].value;
	if (revertTo == null) {
		console.log("rules =", rules);
		// TODO: may need to do final validity checking
		// if (!rules.validate(input)) { ... }
		rules.save.call(this.card, this, inside, input);
	}
	elt.innerHTML = '';
	var text = doc.createTextNode(input);
	elt.appendChild(text);
	elt.onclick = function(ev) { self.editField(ev, elt, rules, inside); }
}

FlasckWrapper.prototype.editableField = function(elt, rules, inside) {
	var self = this;
//	console.log("registering field", elt.id, "as subject to editing");
	elt.className += " flasck-editable";
	elt.flasckEditMode = false; 
	elt.onclick = function(ev) { self.editField(ev, elt, rules, inside); }
}

// TODO: may also need "saveState", or could add another condition in here
FlasckWrapper.prototype.saveObject = function(obj) {
	if (obj === this.card) {
		console.log("is this an attempt to save state?");
		return;
	}
	if (!obj.id) {
		console.log("cannot save object without an id");
		return;
	}
	var foo = this.contractInfo['org.ziniki.KeyValue'].service;
//	console.log(foo._addr, foo._myaddr);
	this.postbox.deliver(foo._addr, {from: foo._myaddr, method: "save", args: [obj] });
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
			else if (message.method == 'dispose')
				this.dispose(message.from);
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
				var uq = self.postbox.unique(ha);
				self.ports.push(uq);
				var handler = { type: 'handler', chan: uq };
				self.postbox.deliver(self.services['org.ziniki.KeyValue'], {from: self.ctrmap['org.ziniki.Init'], method: 'subscribe', args:[id, handler] });
			}
		},
		dispose: function(from) {
		console.log("ports =", self.ports);
			// This stops the bleeding; I think there is more we need to do, probably more we need to do *automatically*, e.g. canceling subscriptions to ZiNC
			for (var c in self.ports) {
				var port = self.ports[c];
				if (port)
					postbox.remove(port);
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
		var uq = this.postbox.unique(ctrAddr);
		this.ports.push(uq);
		this.ctrmap[ctr] = uq;
		contracts[ctr].service._myaddr = uq;
	}
	this.contractInfo = contracts;
	this.postbox.deliver(this.initSvc, {from: this.ctrmap['org.ziniki.Init'], method: 'ready', args:[this.ctrmap]});
}

FlasckWrapper.prototype.dispatchEvent = function(handler, ev) {
	console.log("dispatching event of type", ev.type);
	var msgs = FLEval.full(new FLClosure(this.card, handler, [FLEval.makeEvent(ev)]));
	this.messageEventLoop(msgs);
}

FlasckWrapper.prototype.messageEventLoop = function(flfull) {
	var msgs = FLEval.flattenList(flfull);
	var todo = [];
	while (msgs && msgs.length > 0) {
		msgs = FLEval.flattenList(this.processMessages(msgs, todo));
		console.log("mo msgs =", msgs);
	}
	this.updateDisplay(todo);
}

FlasckWrapper.prototype.processMessages = function(msgs, todo) {
	console.log("processing messages", msgs);
	if (!todo)
		todo = {};
	var momsgs = [];
	for (var i=0;i<msgs.length;i++) {
		var hd = msgs[i];
		var mo = null;
		console.log("Processing message", hd);
		if (hd._ctor === 'Nil')
			;
		else if (hd._ctor === 'Cons')
			mo = this.processMessages(FLEval.flattenList(hd), todo);
		else
			mo = this.processOne(hd, todo);
		if (mo)
			momsgs = momsgs.concat(FLEval.flattenList(mo));
	}
	return momsgs;
}

FlasckWrapper.prototype.processOne = function(msg, todo) {
//	console.log("Message: ", msg);
	if (msg._ctor === 'Send') {
		var target = msg.target;
		if (target === null || target === undefined) {
			console.log("cannot have undefined target");
			return;
		}
		if (typeof target === 'string') {
			target = this.card[msg.target];
			if (target instanceof FLClosure) {
				target = FLEval.full(this.card[msg.target]);
				this.card[msg.target] = target; // if _we_ had to evaluate it, store the output so we don't repeat the evaluation
			}
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
							this.ports.push(a._myaddr);
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
				console.log("There is no method " + meth + " on ", target);
				debugger;
				return;
			}
			return actM.apply(target, args);
		} else {
			console.log("Cannot handle special case:", target._special);
			return;
		}
	} else if (msg._ctor === 'Assign') {
		var into = msg.target;
		if (!into)
			into = this.card;
		into[msg.field] = msg.value;
		todo.push(msg);
	} else if (msg._ctor === 'CrosetInsert' || msg._ctor === 'CrosetReplace' || msg._ctor === 'CrosetRemove') {
		todo.push(msg);		
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

FlasckWrapper.prototype.onUpdate = function(op, obj, field, area, fn) {
	console.log("on update type", op);
	if (op === 'assign' && !fn)
		throw new Error("Must provide fn for assign");
	this.updateAreas.push({op: op, obj: obj, field: field, area: area, fn: fn});
}

FlasckWrapper.prototype.removeOnUpdate = function(op, obj, field, area) {
	for (var i=0;i<this.updateAreas.length;) {
		var ua = this.updateAreas[i];
		if (ua.op == op && ua.area === area && ua.obj == obj && ua.field == field)
			this.updateAreas.splice(i, 1);
		else
			i++;
	}
}

FlasckWrapper.prototype.removeActions = function(area) {
	console.log("remove all actions that have area", area);
	for (var i=0;i<this.updateAreas.length;) {
		var ua = this.updateAreas[i];
		if (ua.area === area)
			this.updateAreas.splice(i, 1);
		else
			i++;
	}
}

FlasckWrapper.prototype.updateDisplay = function(todo) {
	if (!this.div || todo.length == 0)
		return; // need to set up render contract first
		
	// TODO: there is a "premature" optimization step here where we try and avoid duplication
	var doc = this.div.ownerDocument;
	for (var t=0;t<todo.length;t++) {
		var item = todo[t];
		if (item instanceof _Assign) {
			console.log("Assign");
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'assign' || ua.field != item.field || ua.obj != item.target)
					continue;
				ua.fn.call(ua.area, item.target[item.field]);
			}
		} else if (item instanceof _CrosetInsert) {
			console.log("Croset Insert");
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'croins' || ua.obj != item.target)
					continue;
				var child = ua.area._newChild();
				child._crokey = item.key;
				ua.area._insertItem(child);
				child._assignToVar(item.target.get(item.key));
			}
		} else if (item instanceof _CrosetReplace) {
			console.log("Croset Replace");
			var obj = item.target.get(item.key);
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'crorepl') continue;
				if (ua.field != obj.id || ua.obj != item.target)
					continue;
				ua.area._assignToVar(obj);
			}
		} else if (item instanceof _CrosetRemove) {
			console.log("Croset Remove");
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'crodel') continue;
				if (ua.obj != item.target)
					continue;
				ua.area._deleteItem(item.key);
			}
		} else
			throw new Error("Cannot handle item " + item);
	}
}

FlasckWrapper.prototype.showCard = function(slot, cardOpts) {
	var mode = cardOpts.mode || 'local';
	var div = doc.getElementById(this.infoAbout[slot]);
	div.innerHTML = '';
	if (this.cardCache[slot] && !this.cardCache[slot]._isDisposed) {
   		this.cardCache[slot].redrawInto(div);
   		return this.cardCache[slot];
	} else {
  		var svcs = cardOpts.services;
  		if (!svcs || svcs._ctor === 'Nil')
	  		svcs = this.services;
  		var innerCard = Flasck.createCard(this.postbox, div, { mode: mode, explicit: cardOpts.card }, svcs);
  		this.cardCache[slot] = innerCard;
  		return innerCard;
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
