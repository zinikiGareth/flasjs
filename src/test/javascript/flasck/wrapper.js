FlasckWrapper = function(postbox, initSvc, cardClz) {
	this.postbox = postbox;
	this.initSvc = initSvc;
	this.cardClz = cardClz;
	this.ctrmap = {};
	this.card = null; // will be filled in later
	this.div = null;
	return this;
}

FlasckWrapper.prototype.cardCreated = function(card) {
	var self = this;
	this.card = card;
	this.services = {};
	for (var svc in card._services) {
		var svcAddr = this.postbox.newAddress();
		this.postbox.register(svcAddr, card._services[svc]);
		this.services[svc] = this.postbox.unique(svcAddr);
	}
	// THIS MAY OR MAY NOT BE A HACK
	card._contracts['org.ziniki.Init'] = {
		services: function(from, serviceMap) {
			for (var ctr in serviceMap) {
				self.services[ctr] = serviceMap[ctr];
				card._contracts[ctr]._addr = serviceMap[ctr];
			}
		},
		state: function(from) {
			console.log("Setting state");
		}
	}
	card._contracts['org.ziniki.Render'] = {
		render: function(from, opts) {
			self.div = opts.into;
			self.doRender([]);
		}
	}
	// END HACK
	for (var ctr in card._contracts) {
		var ctrAddr = this.postbox.newAddress();
		this.postbox.register(ctrAddr, card._contracts[ctr]);
		this.ctrmap[ctr] = this.postbox.unique(ctrAddr);
		card._contracts[ctr]._myaddr = ctrAddr;
	}
	this.postbox.deliver(this.initSvc, {from: this.ctrmap['org.ziniki.Init'], method: "ready", args:[this.ctrmap]});
}

FlasckWrapper.prototype.getService = function(s) {
	return this.proxies[s];
}

FlasckWrapper.prototype.deliver = function(ctr, meth) { // and arguments
	var hdlr = this.card.contracts[ctr];
//	console.log(hdlr);
//	console.log(hdlr[meth]);
	var args = [];
	for (var i=2;i<arguments.length;i++)
		args[i-2] = arguments[i];
	return FLEval.full(hdlr[meth].apply(hdlr, args));
}

FlasckWrapper.prototype.processMessages = function(l) {
	while (l && l._ctor === 'Cons') {
		this.processOne(l.head);
		l = l.tail;
	}
}

FlasckWrapper.prototype.processOne = function(msg) {
	console.log("Message: ", msg);
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
						var proxy = new FlasckProxy(this, a);
						var chan = channel.conn.newChannel(a._contract, proxy);
						a._onchan = chan.chan;
						proxy.channel(chan);
					} else
						throw new Error("Cannot send an object of type " + a._special);
				}
				args[p] = { type: a._special, chan: a._onchan };
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
FlasckWrapper.prototype.doRender = function(msgs) {
  // TODO: should have a "cachedstate" member variable
  var cached = null;
  if (!cached) { // init case, render the whole tree
    this.div.innerHTML = "";
	this.renderSubtree(this.div, this.cardClz.template);
  }
}

FlasckWrapper.prototype.dispatchEvent = function(ev, handler) {
  var msgs = FLEval.full(new FLClosure(this.card, handler, [ev]));
  this.processMessages(msgs);
  this.doRender(msgs);
}

FlasckWrapper.prototype.renderSubtree = function(into, tree) {
  var doc = into.ownerDocument;
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
	  var svcs = line.services;
	  if (line.services._ctor === 'Nil')
		  svcs = this.services;
	  var innerCard = Flasck.createCard(this.postbox, html, { explicit: line.card }, svcs);
  } else if (tree.type == 'content') {
    html = doc.createElement("span");
    html.appendChild(doc.createTextNode(line.toString()));
  } else if (tree.type == 'switch') {
	html = doc.createElement("div");
  } else
	  throw new Error("Could not render " + tree.type + " " + line);
  // TODO: track the things we do in a cached state
  html.setAttribute('id', 'id_' + nextid++);
  if (tree.type === 'div') {
	if (tree.children) {
      for (var c=0;c<tree.children.length;c++) {
        this.renderSubtree(html, tree.children[c]);
      }
	}
  } else if (tree.type == 'switch') {
	for (var c=0;c<tree.children.length;c++) {
	  var cond = tree.children[c];
	  var cv = true;
	  if (cond.fn)
	    cv = FLEval.full(cond.fn.apply(this.card, [line]));
	  if (cv) {
		  for (var q=0;q<cond.children.length;q++)
			this.renderSubtree(html, cond.children[q]);
		  break;
	  }
	}
  }
  if (tree.class && tree.class.length > 0) {
	  var clz = "";
	  var sep = "";
	  for (var i=0;i<tree.class.length;i++) {
		  if (typeof tree.class[i] === 'string')
			  clz += sep + tree.class[i];
		  else if (typeof tree.class[i] === 'function')
			  clz += sep + FLEval.full(tree.class[i].apply(this.card)); // the rule is it has to be a closed-over function, just needing card
		  else
			  clz += sep + typeof tree.class[i];
		  sep = " ";
	  }
	  html.setAttribute('class', clz);
  }
  into.appendChild(html);
}
