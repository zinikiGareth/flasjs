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
//	console.log("received message", message);
	var meth = this.service[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
//	message.args.splice(0, 0, message.from);
	var clos = meth.apply(this.service, message.args);
//console.log("clos = ", clos);
	var msgs = FLEval.full(clos);
	var todo = this.wrapper.processMessages(msgs);
	if (this.wrapper.div) // so render will have been called
		this.wrapper.doRender(todo);
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
  var todo = this.processMessages(msgs);
  this.doRender(todo);
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
	var updateTree = this.cardClz.updates;
//	console.log("Message: ", msg);
	if (msg._ctor === 'Send') {
		var target = FLEval.head(this.card[msg.target]);
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
				console.log("There is no method " + m + " on ", target);
				return;
			}
			var newmsgs = actM.apply(target, args);
			console.log("object invocation returns closure ", newmsgs);  
			if (updateTree[msg.target])
				todo[msg.target] = {action: 'insert', target: target, crokey: args[0], tree: updateTree[msg.target] };
			// TODO: theoretically at least, objects can spit out more TODO items
			// we need to collect these and put them on one big giant list
			// and then keep calling "setTimeout(0)" at the end here to process that list after this one
			// until we reach a stable state where no more items are generated
		} else {
			console.log("Cannot handle special case:", target._special);
			return;
		}
	} else if (msg._ctor === 'Assign') {
		this.card[msg.field] = msg.value;
		if (updateTree[msg.field])
			todo[msg.field] = {action: 'update', tree: updateTree[msg.field] };
	} else
		throw new Error("The method message " + msg._ctor + " is not supported");
}

var nextid = 1; // TODO: this might actually be the right scoping; what I want is for it global per document
FlasckWrapper.prototype.doInitialRender = function(div) {
	this.div = div;
    this.div.innerHTML = "";
    this.renderState = {};
    var html = this.renderSubtree("", this.div.ownerDocument, this.cardClz.template);
    this.div.appendChild(html);
}

FlasckWrapper.prototype.doRender = function(todo) {
	// Gather into a single, de-duped list of elements to update
	var routes = {};
	var wrapper = this;
	for (var t in todo) {
		var a = todo[t].action;
		console.log("action", a);
		if (a === 'update') {
			todo[t].tree.forEach(function (p) {
				var c = wrapper.nodeCache[p.route];
				if (c == null || c == undefined) {
					console.log("There is nothing for route " + p.route);
					return;
				}
				routes[p.route] = { elt: c.elt, tree: c.tree, me: c.me, action: p.action };
			});
		} else if (a === 'insert') {
			console.log("todo insert", todo[t]);
			var crokey = todo[t].crokey;
			var self = this;
			todo[t].tree.forEach(function(r) {
				console.log("tree", r);
				var rt = r.route;
				var idx = rt.indexOf("+");
				if (idx != -1)
					rt = rt.substring(0, idx);
				var parent = self.nodeCache[rt].me;
				var after = null;
				for (var qi=0;qi<todo[t].target.members.length-1;qi++) {
					if (todo[t].target.members[qi].key === crokey) {
						var xid = todo[t].target.members[qi+1].key;
						after = self.nodeCache[rt+"+"+xid].me;
					}
				} 
				console.log("nc", parent, after);
		    	this.renderState = {}; // may need to bind in existing vars at this point
				var child = wrapper.renderSubtree(rt+"+"+crokey, parent.ownerDocument, r.node);
				if (after) {
					parent.insertBefore(child, after);
				} else {
					parent.append(child);
				}
			});
			return;
		} else
			throw new Error("Cannot handle action " + a);
	}
	// TODO: we need de-dup logic (including removing sub-nodes, which is why we use routes rather than ids)
	for (var qr in routes) {
		var r = routes[qr];
//		console.log("route to render", qr, r.action);
		if (r.action === 'render') {
//			console.log("rewriting ", r.me.id, r.elt.id);
			r.me.innerHTML = "";
		    this.renderState = {}; // may need to bind in existing vars at this point
			wrapper.renderSubtree(qr, r.me, r.tree);
		} else if (r.action === 'renderChildren') {
//			console.log("rewriting ", r.me.id, r.elt.id);
			r.me.innerHTML = "";
		    this.renderState = {}; // may need to bind in existing vars at this point
			wrapper.renderSubtree(qr, r.me, r.tree, true);
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

FlasckWrapper.prototype.renderSubtree = function(route, doc, tree) {
	if (tree.type === 'switch') {
		var send;
		var val = FLEval.full(tree.val.apply(this.card));
		send = doc.createElement("div");
		for (var c=0;c<tree.children.length;c++) {
	  		var cond = tree.children[c];
	  		var cv = true;
	  		if (cond.val)
	    		cv = FLEval.full(cond.val.apply(this.card, [val]));
	  		if (cv) {
		  		for (var q=0;q<cond.children.length;q++) {
		  			var newRoute = this.extendRoute(route, cond.children[q]);
					var child = this.renderSubtree(newRoute, doc, cond.children[q]);
					this.setIdAndCache(newRoute, tree, send, child);
					send.appendChild(child);
				}
		  		break;
	  		}
		}
		
//		this.setIdAndCache(route, into, tree, send);
//		if (!dontRerenderMe)
//			into.appendChild(send);
		return send;
	} else if (tree.type == 'list') { // another special case
//		var newRoute = this.extendRoute(route, tree);
		var plidx = route.lastIndexOf("+");
		var ul = FLEval.full(tree.fn.apply(this.card)).toElement(doc);
		var val = FLEval.full(tree.val.apply(this.card));
//		console.log("val =", val);
		if (val && val._ctor === 'Cons') { // the value may be an FL list
			while (val && val._ctor === 'Cons') {
				var lvar = val.head;
				this.renderState[tree.var] = lvar;
//				console.log("list var = ", tree.var, "ref =", lvar);
				var newRoute = route.substring(0,plidx+1) + lvar.id;
//				console.log("list route = ", newRoute);
				var ldiv = doc.createElement("div");
				ul.appendChild(ldiv);
				this.setIdAndCache(newRoute, tree, ul, ldiv, true);
		  		for (var q=0;q<tree.children.length;q++) {
		  			var extRoute = this.extendRoute(newRoute, tree.children[q]);
					var child = this.renderSubtree(extRoute, doc, tree.children[q]);
					this.setIdAndCache(extRoute, tree.children[q], ldiv, child);
					ldiv.appendChild(child);
				}
	    		val = val.tail;
	    	}
	    } else if (val && val._ctor === 'Croset') { // or it may be a Croset
			for (var cri=0;cri<val.members.length;cri++) {
				var lvar = val.members[cri];
				this.renderState[tree.var] = lvar.value;
				console.log("newRoute = ", route, "list var = ", tree.var, "ref =", lvar);
				var newRoute = route.substring(0,plidx+1) + lvar.key;
				console.log("list route = ", newRoute);
				var ldiv = doc.createElement("div");
				ul.appendChild(ldiv);
				this.setIdAndCache(newRoute, tree, ul, ldiv, true);
		  		for (var q=0;q<tree.children.length;q++) {
		  			var extRoute = this.extendRoute(newRoute, tree.children[q]);
					var child = this.renderSubtree(extRoute, doc, tree.children[q]);
					this.setIdAndCache(extRoute, tree.children[q], ldiv, child);
					ldiv.appendChild(child);
				}
	    	}
	    }
		return ul;
	} else {
		// the majority of cases, grouped together
		var line = FLEval.full(tree.fn.apply(this.card));
		var html;
//		console.log("line =", line);
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
//        		console.log("have it already");
        		this.cardCache[tree.route].redrawInto(html);
      		} else {
//	  	  		console.log("creating card for ", tree);
//	  			var newRoute = this.extendRoute(route, tree);
		  		var svcs = line.services;
		  		if (line.services._ctor === 'Nil')
			  		svcs = this.services;
		  		var innerCard = Flasck.createCard(this.postbox, html, { explicit: line.card }, svcs);
		  		this.cardCache[tree.route] = innerCard;
//		  		console.log(this.cardCache);
	  		}
  		} else if (tree.type == 'content') {
  			var cache = this.nodeCache[tree.route];
//  			console.log("html =", cache);
  			if (cache)
  				html = cache.me;
  			else
    			html = doc.createElement("span");
    		if (line != null)
    			html.appendChild(doc.createTextNode(line.toString()));
//    		if (cache)
//    			return;
  		} else
	  		throw new Error("Could not render " + tree.type + " " + line);
  		if (tree.type === 'div') {
			if (tree.children) {
      			for (var c=0;c<tree.children.length;c++) {
		  			var newRoute = this.extendRoute(route, tree.children[c]);
      				var child = this.renderSubtree(newRoute, doc, tree.children[c]);
					this.setIdAndCache(newRoute, tree.children[c], html, child);
        			html.appendChild(child);
      			}
			}
		}
		return html;
	}
}

FlasckWrapper.prototype.extendRoute = function(route, tree) {
	var idx = tree.route.lastIndexOf(".");
	var ext = tree.route;
	if (idx != -1)
		ext = ext.substring(idx);
	return route + ext;
}

FlasckWrapper.prototype.setIdAndCache = function(route, tree, parent, child, useplus) {
	var tr = route;
	if (!useplus) {
		var dotIdx = tr.lastIndexOf(".");
		var plusIdx = tr.lastIndexOf("+");
		if (plusIdx != -1 && plusIdx > dotIdx)
			tr = tr.substring(0, plusIdx);
	}
	var theId = 'id_' + nextid++;
 	child.setAttribute('id', theId);
 	child.setAttribute('x-route', tr);
  	if (tr || tr === '') {
	    this.nodeCache[tr] = { tree: tree, parent: parent, me: child  };
  	}
  	console.log("created", theId, "for route", tr, "with", tree.route);
}
