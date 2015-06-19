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
	this.wrapper = wrapper;
	this.service = service;
}

FlasckWrapper.Processor.prototype.process = function(message) {
	console.log("received message", message);
	var meth = this.service[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
//	message.args.splice(0, 0, message.from);
	var clos = meth.apply(this.service, message.args);
console.log("clos = ", clos);
	var msgs = FLEval.full(clos);
	this.wrapper.processMessages(msgs);
	if (this.wrapper.div) // so render will have been called
		this.wrapper.doRender(msgs);
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
		console.log("ctr = " + ctr);
		if (ctr === 'org.ziniki.Init')
			userInit = contracts[ctr];
	}
	// THIS MAY OR MAY NOT BE A HACK
	contracts['org.ziniki.Init'] = {
		process: function(message) {
			if (message.method === 'services')
				this.services(message.from, message.args[0]);
			else if (message.method === 'state')
				this.state(message.from, message.args[0]);
			else
				throw new Error("Cannot process " + message.method);
		},
		services: function(from, serviceMap) {
			for (var ctr in serviceMap) {
				self.services[ctr] = serviceMap[ctr];
				if (card._contracts[ctr])
					card._contracts[ctr]._addr = serviceMap[ctr];
			}
		},
		state: function(from) {
			console.log("Setting state");
			// OK ... I claim it's ready now
			if (userInit) {
				userInit.process({from: from, method: 'onready', args: []});
			}
		},
		service: {} // to store _myaddr
	}
	contracts['org.ziniki.Render'] = {
		process: function(message) {
			if (message.method === 'render')
				this.render(message.from, message.args[0]);
			else
				throw new Error("Cannot process " + message.method);
		},
		render: function(from, opts) {
			self.doInitialRender(opts.into);
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
  this.processMessages(msgs);
  this.doRender(msgs);
}

FlasckWrapper.prototype.processMessages = function(l) {
	while (l && l._ctor === 'Cons') {
		this.processOne(l.head);
		l = l.tail;
	}
}

FlasckWrapper.prototype.processOne = function(msg) {
//	console.log("Message: ", msg);
	if (msg._ctor === 'Send') {
		var addr = msg.target._addr;
		var meth = msg.method;
//		var invoke = target.request;
//		console.log("channel ", channel, channel instanceof Channel);
//		console.log("meth " + meth);
//		console.log("invoke " + invoke);
//		console.log("method = " + meth + " args = " + msg.args);
		var args = FLEval.flattenList(msg.args);
//		console.log(args);
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
//		console.log(args);
		this.postbox.deliver(addr, {from: msg.target._myaddr, method: meth, args: args });
	} else if (msg._ctor === 'Assign') {
//		console.log("card = ", this.card);
//		console.log("field = ", msg.field);
//		console.log("value = ", msg.value);
		this.card[msg.field] = msg.value;
	} else
		throw new Error("The method message " + msg._ctor + " is not supported");
}

var nextid = 1; // TODO: this might actually be the right scoping; what I want is for it global per document
FlasckWrapper.prototype.doInitialRender = function(div) {
	this.div = div;
    this.div.innerHTML = "";
    this.renderState = {};
    this.renderSubtree(this.div, this.cardClz.template);
}

FlasckWrapper.prototype.doRender = function(msgs) {
	var l = msgs;
	var updateTree = this.cardClz.updates;
	var todo = {};
	while (l && l._ctor === 'Cons') {
		if (l.head._ctor === 'Assign') {
			if (updateTree[l.head.field])
				todo[l.head.field] = updateTree[l.head.field];
		}
		l = l.tail;
	}
	// Gather into a single, de-duped list of elements to update
	var routes = {};
	var wrapper = this;
	for (var t in todo) {
		todo[t].forEach(function (p) {
			var c = wrapper.nodeCache[p.route];
			if (c == null || c == undefined) {
				console.log("There is nothing for route " + p.route);
				return;
			}
			routes[p.route] = { elt: c.elt, tree: c.tree, me: c.me, action: p.action };
		});
	}
	// TODO: we need de-dup logic (including removing sub-nodes, which is why we use routes rather than ids)
	for (var qr in routes) {
		var r = routes[qr];
		if (r.action === 'render') {
//			console.log("rewriting ", r.me.id, r.elt.id);
			r.me.innerHTML = "";
		    this.renderState = {}; // may need to bind in existing vars at this point
			wrapper.renderSubtree(r.me, r.tree);
		} else if (r.action === 'renderChildren') {
//			console.log("rewriting ", r.me.id, r.elt.id);
			r.me.innerHTML = "";
		    this.renderState = {}; // may need to bind in existing vars at this point
			wrapper.renderSubtree(r.me, r.tree, true);
		} else if (r.action === 'attrs') {
			var line = FLEval.full(r.tree.fn.apply(this.card));
			var html;
			if (line instanceof DOM._Element) {
//				html = line.toElement(r.me.ownerDocument);
				line.updateAttrsIn(r.me); // do we need to bind in the vars here?
			} else
				throw new Error("This case is not covered: " + line);
		} else
			throw new Error("Cannot carry out action " + r.action);
	}
}

FlasckWrapper.prototype.renderSubtree = function(into, tree, dontRerenderMe) {
    var doc = into.ownerDocument;
	if (tree.type === 'switch') {
		var send;
		var val = FLEval.full(tree.val.apply(this.card));
		if (dontRerenderMe)
			send = into;
		else
			send = doc.createElement("div");
		for (var c=0;c<tree.children.length;c++) {
	  		var cond = tree.children[c];
	  		var cv = true;
	  		if (cond.val)
	    		cv = FLEval.full(cond.val.apply(this.card, [val]));
	  		if (cv) {
		  		for (var q=0;q<cond.children.length;q++)
					this.renderSubtree(send, cond.children[q]);
		  		break;
	  		}
		}
		this.setIdAndCache(into, tree, send);
		if (!dontRerenderMe)
			into.appendChild(send);
	} else if (tree.type == 'list') { // another special case 
		var ul = FLEval.full(tree.fn.apply(this.card)).toElement(doc);
		var val = FLEval.full(tree.val.apply(this.card));
		console.log(val);
		while (val && val._ctor === 'Cons') {
			var lvar = val.head;
			this.renderState[tree.var] = lvar;
	  		for (var q=0;q<tree.children.length;q++)
				this.renderSubtree(ul, tree.children[q]);
    		val = val.tail;
    	}
		into.appendChild(ul);
		this.setIdAndCache(into, tree, ul);
	} else {
		// the majority of cases, grouped together
		var line = FLEval.full(tree.fn.apply(this.card));
		var html;
		if (line instanceof DOM._Element) {
			html = line.toElement(doc);
			var evh = line.events;
			while (evh && evh._ctor === 'Cons') {
				var ev = evh.head;
      			if (ev._ctor === 'Tuple' && ev.length === 2) {
    	  			var wrapper = this;
    	  			html['on'+ev.members[0]] = function(event) { wrapper.dispatchEvent(event, ev.members[1]); }
      			}
      			evh = evh.tail;
    		}
  		} else if (line instanceof _CreateCard) {
	  		html = line.into.toElement(doc);
      		if (this.cardCache[tree.route]) {
        		console.log("have it already");
        		this.cardCache[tree.route].redrawInto(html);
      		} else {
	  	  		console.log("creating card for ", tree);
		  		var svcs = line.services;
		  		if (line.services._ctor === 'Nil')
			  		svcs = this.services;
		  		var innerCard = Flasck.createCard(this.postbox, html, { explicit: line.card }, svcs);
		  		this.cardCache[tree.route] = innerCard;
		  		console.log(this.cardCache);
	  		}
  		} else if (tree.type == 'content') {
    		html = doc.createElement("span");
    		html.appendChild(doc.createTextNode(line.toString()));
  		} else
	  		throw new Error("Could not render " + tree.type + " " + line);
		this.setIdAndCache(into, tree, html);
  		if (tree.type === 'div') {
			if (tree.children) {
      			for (var c=0;c<tree.children.length;c++) {
        			this.renderSubtree(html, tree.children[c]);
      			}
			}
		}
	  	into.appendChild(html);
	}
}

this.FlasckWrapper.prototype.setIdAndCache = function(into, tree, html) {
 	html.setAttribute('id', 'id_' + nextid++);
  	if (tree.route || tree.route === '') {
	    this.nodeCache[tree.route] = { elt: into, tree: tree, me: html  };
  	}
}
