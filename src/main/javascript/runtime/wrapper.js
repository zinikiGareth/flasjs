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
	this.service = service;
}

FlasckWrapper.Processor.prototype.process = function(message) {
	"use strict"
//	console.log("received message", message);
	var meth = this.service[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	var args = [];
	for (var i=0;i<message.args.length;i++)
		args.push(FLEval.fromWireService(message.from, message.args[i]));
	var clos = meth.apply(this.service, args);
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
	if (!obj._fromService) {
		console.log("cannot automatically save object", obj, "because it does not have a _fromService tag.  Is it new?  a sub-object?  a new case?");
		return;
	}
	
	// TODO: this may seem slightly more complex than it "needs" to be, but it considers the case that it's a different service that doesn't just have "save"
	// also, it means we don't have to store two pointers, remote & local
	if (this.contractInfo['org.ziniki.KeyValue'].service._addr === obj._fromService)
		service = this.contractInfo['org.ziniki.KeyValue'].service;
	else if (this.contractInfo['org.ziniki.Persona'].service._addr === obj._fromService)
		service = this.contractInfo['org.ziniki.Persona'].service;
	else {
		console.log("don't know how to save to service associated with", obj);
		return;
	}
	this.postbox.deliver(obj._fromService, {from: service._myaddr, method: "save", args: [obj] });
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
	var userCroset;
	var kvupdate;
	// After long deliberation, this is NOT a hack
	// This is more by way of a proxy or an impedance-matching layer
	// Another way of thinking about it is that it is doing "boilerplate" things that are required by the underlying Flasck/Card paradigm, but that FLAS users shouldn't need to do
	// For example:
	//  * the initial handshaking about services
	//  * rewriting object IDs when Ziniki creates them
	//  * monkeying around with Croset changes
	var contracts = {};
	for (var ctr in card._contracts) {
		contracts[ctr] = new FlasckWrapper.Processor(this, card._contracts[ctr]);
		if (ctr === 'org.ziniki.Init')
			userInit = contracts[ctr];
		else if (ctr == 'org.ziniki.Croset')
			userCroset = contracts[ctr];
		else if (ctr == 'org.ziniki.Render')
			throw new Error("Users cannot define " + ctr);
	}
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
			var uf = function(obj) {
				if (userInit && userInit.service.update)
					userInit.process({from: from, method: 'update', args: [obj]});
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
				// not sure to what extent this is a hack ...
				if (id.substring(0, 11) === 'personafor/') {
					var next = id.substring(11);
					var idx = next.indexOf('/');
					var appl = next.substring(0, idx);
					next = next.substring(idx+1);
					idx = next.indexOf('/');
					if (idx >= 0)
						next = next.substring(0, idx);
					self.postbox.deliver(self.services['org.ziniki.Persona'], {from: self.ctrmap['org.ziniki.Init'], method: 'forApplication', args:[appl, next, handler] });
				} else if (id.substring(0, 9) === 'resource/') {
					self.postbox.deliver(self.services['org.ziniki.KeyValue'], {from: self.ctrmap['org.ziniki.Init'], method: 'resource', args:[id, handler] });
				} else {
					self.postbox.deliver(self.services['org.ziniki.KeyValue'], {from: self.ctrmap['org.ziniki.Init'], method: 'typed', args:[id, handler] });
				}
			}
		},
		dispose: function(from) {
			// This stops the bleeding; I think there is more we need to do, probably more we need to do *automatically*, e.g. canceling subscriptions to ZiNC
			for (var c in self.ports) {
				var port = self.ports[c];
				if (port)
					postbox.remove(port);
			}
		},
		service: {} // to store _myaddr
	}
	contracts['org.ziniki.Croset'] = {
		process: function(message) {
			"use strict";
			/*
			if (message.method === 'services')
				this.services(message.from, message.args[0]);
			else if (message.method === 'state')
				this.state(message.from, message.args[0]);
			else if (message.method === 'loadId')
				this.loadId(message.from, message.args[0]);
			else if (message.method == 'dispose')
				this.dispose(message.from);
			else
			*/
				userCroset.process(message);
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
			if (!self.card._render)
				console.log("There is no method _render on ", self.card);
			else {
				if (opts.into)
					self.div = opts.into;
				self.card._render.call(self.card, self.div.ownerDocument, self, self.div);
			}
		},
		service: {} // to store _myaddr
	}
	// END OF PROXY DEFINITIONS
	for (var ctr in contracts) {
		var ctrAddr = this.postbox.newAddress();
		this.postbox.register(ctrAddr, contracts[ctr]);
		var uq = this.postbox.unique(ctrAddr);
		this.ports.push(uq);
		this.ctrmap[ctr] = uq;
		contracts[ctr].service._myaddr = uq;
	}
	if (userCroset)
		userCroset.service._myaddr = contracts['org.ziniki.Croset'].service._myaddr;
	this.contractInfo = contracts;
	this.postbox.deliver(this.initSvc, {from: this.ctrmap['org.ziniki.Init'], method: 'ready', args:[this.ctrmap]});
}

FlasckWrapper.prototype.dispatchEvent = function(handler, ev) {
//	console.log("dispatching event of type", ev.type);
	var msgs = FLEval.full(new FLClosure(this.card, handler, [FLEval.makeEvent(ev)]));
	this.messageEventLoop(msgs);
}

FlasckWrapper.prototype.messageEventLoop = function(flfull) {
	var msgs = FLEval.flattenList(flfull);
	var todo = [];
	while (msgs && msgs.length > 0) {
		msgs = FLEval.flattenList(FLEval.full(this.processMessages(msgs, todo)));
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
//		console.log("Processing message", hd);
		if (hd._ctor === 'Nil')
			;
		else if (hd._ctor === 'Cons')
			mo = this.processMessages(FLEval.flattenList(hd), todo);
		else
			mo = this.processOne(hd, todo);
		if (mo)
			momsgs = momsgs.concat(FLEval.flattenList(FLEval.full(mo)));
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
			target = this.card[target];
			if (target instanceof FLClosure) {
				target = FLEval.full(this.card[target]);
				this.card[msg.target] = target; // if _we_ had to evaluate it, store the output so we don't repeat the evaluation
			}
		}
		if (!target._special) {
			console.log("Target for send is not 'special'", msg.target);
			debugger;
			return;
		}
		var meth = msg.method;
		if (target._special === 'contract') {
			var args = [];
			var l = msg.args;
			while (l && l._ctor === 'Cons') {
				args.push(FLEval.toWire(this, l.head));
				l = l.tail;
			}
			var addr = target._addr;
			if (!addr) {
				console.log("No service was provided for " + target._contract);
				return;
			}
			console.log("trying to send", meth, args, "to", addr);
			this.postbox.deliver(addr, {from: target._myaddr, method: meth, args: args });
		} else if (target._special === 'object') {
			var args = FLEval.flattenList(msg.args);
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
		if (msg.value._ctor === 'MessageWrapper') {
			into[msg.field] = msg.value.value;
			todo.push(Assign(into, msg.field, msg.value.value));
			return msg.value.msgs;
		}
		into[msg.field] = msg.value;
		todo.push(msg);
	} else if (msg._ctor === 'CrosetInsert' || msg._ctor === 'CrosetReplace' || msg._ctor === 'CrosetRemove' || msg._ctor === 'CrosetMove') {
		var meth;
		switch (msg._ctor) {
		case 'CrosetInsert':
			meth = 'insert';
			args = [msg.target.crosetId, msg.key.toString(), msg.key.id];
			break;
		case 'CrosetMove':
			meth = 'move';
			args = [msg.target.crosetId, msg.from.id, msg.from.toString(), msg.to.toString()];
			break;
		case 'CrosetRemove':
			if (msg.forReal) {
				meth = 'delete';
				args = [msg.target.crosetId, msg.key.toString(), msg.key.id];
			}
			// otherwise this is just removing it from the local copy ... should we actually make these different messages?
			break;
		case 'CrosetReplace':
			// This is just a change to the actual object, which should be separately recorded; the Croset does not change
			break;
		default:
			console.log("don't handle", msg);
			debugger;
		}
		if (meth)
			this.postbox.deliver(this.services['org.ziniki.Croset'], {from: this.contractInfo['org.ziniki.Croset'].service._myaddr, method: meth, args: args });
		todo.push(msg);
	} else if (msg._ctor === 'CreateCard') {
		// If the user requests that we make a new card in response to some action, we need to know where to place it
		// The way we fundamentally know this is to look at the "where" option
		var options = FLEval.flattenMap(msg.options);
		var where = options.where;
		delete options.where;
		if (!where)
			throw new Error("Can't display a card nowhere");
		else if (where === 'overlay') {
			var overlay = this.div.ownerDocument.getElementById('flasck_popover_div');
            this.showCard(overlay, options);
            var popover = this.div.ownerDocument.getElementById('flasck_popover');
            if (!popover.isOpen)
            	popover.showModal();
   		} else {
   			// assume that 'where' is the name of a div
			var div = this.div.ownerDocument.getElementById(where);
   			this.showCard(div, options); 
		}
	} else if (msg._ctor == 'Debug') {
		var val = FLEval.full(msg.value);
		console.log("Debug:", val);
	} else
		throw new Error("The method message " + msg._ctor + " is not supported");
}

FlasckWrapper.prototype.convertSpecial = function(obj) {
	if (!obj._onchan) {
		if (obj._special === 'handler') {
			var proxy = new FlasckWrapper.Processor(this, obj);
			var ha = this.postbox.newAddress();
			this.postbox.register(ha, proxy);
			obj._myaddr = this.postbox.unique(ha);
			this.ports.push(obj._myaddr);
		} else
			throw new Error("Cannot send an object of type " + a._special);
	}
	// TODO: I can't help feeling type should be "_type" or "_special" ... this is the wire format, after all
	return { type: obj._special, chan: obj._myaddr };
}

FlasckWrapper.prototype.onUpdate = function(op, obj, field, area, fn) {
	if (!obj) obj = this.card; // should we insist on getting the card by throwing an error if not?
	if (op === 'assign' && !fn)
		throw new Error("Must provide fn for assign");
// 	console.log("added update", this.updateAreas.length, ":", op, obj, field);
	this.updateAreas.push({op: op, obj: obj, field: field, area: area, fn: fn});
// 	console.log("updateAreas length =", this.updateAreas.length);
}

FlasckWrapper.prototype.removeOnUpdate = function(op, obj, field, area) {
	if (!obj) obj = this.card; // should we insist on getting the card by throwing an error if not?
	for (var i=0;i<this.updateAreas.length;) {
		var ua = this.updateAreas[i];
		if (ua.op == op && ua.area === area && ua.obj == obj && ua.field == field) {
			this.updateAreas.splice(i, 1);
//			console.log("removed update #", i, op, obj, field);
		} else
			i++;
	}
}

FlasckWrapper.prototype.removeActions = function(area) {
//	console.log("remove all actions that have area", area);
	for (var i=0;i<this.updateAreas.length;) {
		var ua = this.updateAreas[i];
		if (ua.area === area) {
			this.updateAreas.splice(i, 1);
			console.log("removed update #", i, ua.op, ua.obj, ua.field);
		} else
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
//			console.log("Assign");
			var target = item.target || this.card;
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'assign') continue;
				if (ua.field != item.field || ua.obj != target)
					continue;
//				console.log("assign", i, ua.area, target, item.field, obj);
				ua.fn.call(ua.area, target[item.field]);
			}
		} else if (item instanceof _CrosetInsert) {
//			console.log("Croset Insert");
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'croset' || ua.obj != item.target)
					continue;
				var child = ua.area._newChild();
				child._crokey = item.key;
				ua.area._insertItem(child);
				
				// Hard question: what do we do when we have "inserted" something of nothing?
				// i.e. we have created a "member" with a key and an ID, but nothing in the hash?
				// I am currently taking the option to send across "just the id"
				var obj = item.target.memberOrId(item.key);

				// Either way, pass the object
				child._assignToVar(obj);
			}
		} else if (item instanceof _CrosetReplace) {
//			console.log("Croset Replace");
			var obj = item.target.member(item.key);
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'crorepl') continue;
				if (ua.field != obj.id || ua.obj != item.target)
					continue;
//				console.log("crorepl", i, ua.area, item.target, obj);
				ua.area._assignToVar(obj);
			}
		} else if (item instanceof _CrosetRemove) {
//			console.log("Croset Remove");
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'croset') continue;
				if (ua.obj != item.target)
					continue;
				ua.area._deleteItem(item.key);
			}
		} else if (item instanceof _CrosetMove) {
//			console.log("Croset Move");
			for (var i=0;i<this.updateAreas.length;i++) {
				var ua = this.updateAreas[i];
				if (ua.op != 'croset') continue;
				if (ua.obj != item.target)
					continue;
				ua.area._moveItem(item.from, item.to);
			}
		} else
			throw new Error("Cannot handle item " + item);
	}
}

FlasckWrapper.prototype.showCard = function(into, cardOpts) {
	if (!cardOpts.mode)
		cardOpts.mode = 'local';
	if (!into)
		throw new Error("Must specify a div to put the card into");
	into.innerHTML = '';
	/* I accept the intent of this, but I don't see how it works - if it works
	var uid = into.id;
	if (this.cardCache[uid] && !this.cardCache[uid]._isDisposed) {
   		this.cardCache[uid].redrawInto(into);
   		return this.cardCache[uid];
	} else {
	*/
  		var svcs = cardOpts.services;
  		if (!svcs || svcs._ctor === 'Nil')
	  		svcs = this.services;
  		var innerCard = Flasck.createCard(this.postbox, into, cardOpts, svcs);
//  		this.cardCache[uid] = innerCard;
  		return innerCard;
//	}
}

function d3attrFn(card, flfn) {
    return function(d, i) {
        var elt = { _ctor: 'D3Element', data: d, idx: i }
        return FLEval.full(flfn.call(card, elt));
    }
}

FlasckWrapper.prototype.updateD3 = function(svg, info) { // TODO: other args
	info = FLEval.full(info);
	// info is an assoc of key -> value
	// info.data is a function returning the list of data items (of any type; that's up to the user code to sort out)
    var mydata = FLEval.flattenList(StdLib.assoc(info, "data").call(this.card));
    
    // info.enter is a list of zero-or-more 'enter' methods on the card each of which is () -> [D3Action] 
    var enter = StdLib.assoc(info, "enter");
    var cmds = [];
    while (enter._ctor === 'Cons') {
        var a = enter.head;
        var v = FLEval.full(a.apply(this.card));
        cmds.push({ select: v.head.args.head, insert: v.head.args.head });
        enter = enter.tail;
    }
    
    // info.layout is a list of zero-or-more layouts on the card, each of which is a pair of (pattern, [prop]) where each prop is a pair (name, value-or-function)
    var layout = StdLib.assoc(info, "layout");
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
