// "REAL" SIDE

// The container is the main thing on the "real" side
FlasckContainer = function() {
	this.services = {};
	return this;
}

FlasckContainer.prototype.addService = function(name, service) {
	this.services[name] = service;
}

FlasckContainer.prototype.getService = function(name) {
	if (!this.services[name])
		throw new Error("There is no service " + name);
	return this.services[name];
}

FlasckContainer.prototype.createCard = function(cardClz, inside, provideServices) {
	// put it somewhere
	var doc = inside.ownerDocument;
	var elt = doc.createElement("div");
	var actualDiv = inside.appendChild(elt);

	// create the plumbing
	var handle = new FlasckHandle(this);
	var downconn = new DownConnection(handle);
	handle.conn = downconn;
	var upconn = new UpConnection(this);
	downconn.up = upconn;
	upconn.down = downconn;

	var services = {};
	for (var i=0;i<provideServices.length;i++) {
		services[provideServices[i]] = upconn; // I'm not quite sure what this should be ...
	}
	
	// Create a wrapper around the card which is its proto-environment to link back up to the real environment
	var wrapper = new FlasckWrapper(actualDiv, services, cardClz);

	// Now create the card and tell the wrapper about it
	var myCard = new cardClz({ wrapper: wrapper });
	wrapper.cardCreated(myCard);
	
	// this only works because we're in the same scope
	handle._cheatAccess = { card: myCard, wrapper: wrapper };

	//if (handle.hasContract('test.ziniki.Init'))
	handle.send('org.ziniki.Init', 'load', null);
	return handle;
}

// Services are the individual objects that do work on the "real" side
// for now at least, I'm treating this as a package
FlasckService = function() {
	throw new "Abstract";
}

var addClient = function(cli) {
	this.clients.push(cli);
}

FlasckService.InitService = function() {
	this.clients = [];
	return this;
}
FlasckService.InitService.prototype.addClient = addClient;

FlasckService.TimerService = function() {
	this.clients = [];
	return this;
}
FlasckService.TimerService.prototype.addClient = addClient;
FlasckService.TimerService.prototype.requestTicks = function(client, handler, amount) {
//	console.log("Add timer for handler", handler);
//	console.log("interval should be every " + amount + "s");
	setInterval(function() {
		client.handle.sendTo(handler.chan, "onTick")
	}, 1000);
}

// TODO: it seems wrong to me to have a "service" for a handler, but the logic as currently written requires it.
// TODO: sort this out when on my next refactor cycle
FlasckService.OnTickService = function() {
	this.clients = [];
	return this;
}
FlasckService.OnTickService.prototype.addClient = addClient;

FlasckService.ProxyService = function() {
	this.clients = [];
	return this;
}
FlasckService.ProxyService.prototype.addClient = addClient;

// Clients are the "handles" connecting to the "proxy"; exists on the "real" side
FlasckClient = function(chan, handle, svc) {
	this.chan = chan;
	this.handle = handle;
	this.service = svc;
	svc.addClient(this);
}

FlasckClient.prototype.request = function(method, args) {
	args.splice(0, 0, this);
	this.service[method].apply(this.service, args);
}

// This is the thing that "represents" the card on the container side
FlasckHandle = function(container) {
	this.container = container;
	this.conn = null;
	this.contracts = {};
	this.channels = {};
}

FlasckHandle.prototype.newChannel = function(chan, contract) {
	this.conn.dispatch[chan] = new FlasckClient(chan, this, this.container.getService(contract));
	this.channels[contract] = chan;
}

FlasckHandle.prototype.hasContract = function(ctr) {
	return !!this.channels[ctr];
}

FlasckHandle.prototype.send = function(ctr, method /* args */) {
	if (!this.channels[ctr])
		throw new Error("There is no channel for contract " + ctr);
	var chan = this.channels[ctr];
//	console.log("sending to " + chan);
	var args = [];
	for (var i=2;i<arguments.length;i++)
		args[i-2] = arguments[i];
	this.conn.send({ chan: chan, message: { method: method, args: args } });
}

FlasckHandle.prototype.sendTo = function(chan, method /* args */) {
//	console.log("sending to " + chan);
//	console.log("method is " + method);
	var args = [];
	for (var i=2;i<arguments.length;i++)
		args[i-2] = arguments[i];
	this.conn.send({ chan: chan, message: { method: method, args: args } });
}

// The pipe
// DownConnection is in the containing environment and sends messages "Down" and receives and dispatches "Up" messages
DownConnection = function(handle) {
	var self = this;
	this.handle = handle;
	this.chan = 2;
	this.dispatch = {};
	this.dispatch[0] = new Object();
	this.dispatch[0].request = function(method, args) {
		self.handle.newChannel(args.chan, args.contract);
	}
}

DownConnection.prototype.newChannel = function(ctr, handler) {
	this.ctr = ctr;
	this.handler = handler;
	var ret = new Channel(this, this.chan, handler);
	this.dispatch[this.chan] = ret;
	this.up.deliver({ chan: 0, message: { method: "newChannel", args: { chan: this.chan, contract: ctr }}});
	this.chan += 2;
	return ret;
}

DownConnection.prototype.send = function(msg) {
	// we should clone this message
//	console.log("sending down ", msg);
//	msg = JSON.parse(JSON.stringify(msg));
	this.up.deliver(msg);
//	console.log(this.dispatch, chan);
//	var hdlr = this.dispatch[chan];
//	console.log(hdlr);
//	console.log(hdlr[method]);
//	return FLEval.full(hdlr[method].apply(hdlr, argArray));
}

DownConnection.prototype.deliver = function(msg) {
//	console.log("down deliver: ", this.dispatch, msg);
	var handle = this.dispatch[msg.chan];
	var args = msg.message.args;
//	console.log("service request for ", msg.message.method);
	for (var i=0;i<args.length;i++) {
//		console.log(args[i]);
		if (args[i].type && args[i].type === 'handler' && args[i].chan)
			args[i] = this.dispatch[args[i].chan];
	}
	handle.request(msg.message.method, msg.message.args);
}

// UpConnection is in the "sandbox" and sends messages "Up" and receives and dispatches "Down" messages
UpConnection = function() {
	this.chan = 1;
	this.dispatch = {};
}

UpConnection.prototype.newChannel = function(ctr, handler) {
//	console.log(ctr, handler);
	this.ctr = ctr;
	this.handler = handler;
	var ret = new Channel(this, this.chan, handler);
	this.dispatch[this.chan] = ret;
	this.down.deliver({ chan: 0, message: { method: "newChannel", args: { chan: this.chan, contract: ctr }}});
	this.chan += 2;
	return ret;
}

UpConnection.prototype.send = function(msg) {
	// we should clone this message
//	console.log("sending message ", msg)
	msg = JSON.parse(JSON.stringify(msg));
	this.down.deliver(msg);
}

// This is where we deliver messages DOWN to the CARD
UpConnection.prototype.deliver = function(msg) {
//	console.log("up deliver: ", msg); //this.dispatch[msg.chan].handler);
	if (!this.dispatch[msg.chan]) {
		console.log("There is no card-side channel " + msg.chan);
		return;
	}
	this.dispatch[msg.chan].handler.invoke(msg.message);
}

// Channels inside the main connection
Channel = function(conn, chan, handler) {
	this.conn = conn;
	this.chan = chan;
	this.handler = handler;
}

Channel.prototype.send = function(method, args) {
//	console.log("sending to " + this.chan);
	this.conn.send({ chan: this.chan, message: { method: method, args: args } });
}

// Card Side

// FlasckWrapper is the pseudo "environment" on the card side
FlasckWrapper = function(div, services, cardClz) {
	this.div = div;
	this.services = services;
	this.cardClz = cardClz;
	this.card = null; // will be filled in later
	return this;
}

FlasckWrapper.prototype.cardCreated = function(card) {
	this.card = card;
	this.proxies = {};
	for (var ctr in card.contracts) {
		var svc = this.services[ctr];
		if (svc == null) // TODO: it should be possible for cards to opt to degrade in this case (& also shouldn't have been selected)
			throw new Error("There is no service provided for " + ctr);
		var proxy = this.proxies[svc] = new FlasckProxy(this, card.contracts[ctr]);
		proxy.channel(svc.newChannel(ctr, proxy));
		card.contracts[ctr]._proxy = proxy;
	}
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
//	console.log("Message: ", msg);
	if (msg._ctor === 'Send') {
		var channel = msg.target._proxy.chan;
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
		channel.send(meth, args);
	} else if (msg._ctor === 'Assign') {
//		console.log("card = ", this.card);
//		console.log("field = ", msg.field);
//		console.log("value = ", msg.value);
		this.card[msg.field] = msg.value;
	} else
		throw new Error("The method message " + msg._ctor + " is not supported");
}

// This is very similar to the FlackContainer version, but the idea should be
// to try and connect the parent provided services to the child without having us
// as an intermediary.  This does not currently work
FlasckWrapper.prototype.createCard = function(cardClz, inside, provideServices) {
	// put it somewhere
	var doc = inside.ownerDocument;
	var elt = doc.createElement("div");
	var actualDiv = inside.appendChild(elt);

	var self = this;
	// create the plumbing
	var handle = new FlasckHandle({
		proxied: {},
		getService: function(s) {
			if (this.proxied[s])
				return this.proxied[s];
			var ret = new FlasckService.ProxyService();
			this.proxied[s] = ret;
			return ret;
		}
	});
	var downconn = new DownConnection(handle);
	handle.conn = downconn;
	var upconn = new UpConnection(this);
	downconn.up = upconn;
	upconn.down = downconn;

	var services = {};
	// TODO: we should flatten provideServices into an array & test for length 0
	if (provideServices._ctor === 'Nil') {
		for (var ps in this.services)
			services[ps] = upconn;
	} else {
		for (var i=0;i<provideServices.length;i++) {
			var ps = provideServices[i];
			if (!this.services[ps])
				throw new Error("Cannot create service " + ps + " because we don't have it ourselves");
			services[provideServices[i]] = this.services[provideServices[i]];
		}
	}
	
	// Create a wrapper around the card which is its proto-environment to link back up to the real environment
	var wrapper = new FlasckWrapper(actualDiv, services, cardClz);

	// Now create the card and tell the wrapper about it
	var myCard = new cardClz({ wrapper: wrapper });
	wrapper.cardCreated(myCard);
	
	// this only works because we're in the same scope
	handle._cheatAccess = { card: myCard, wrapper: wrapper };

	//if (handle.hasContract('test.ziniki.Init'))
	handle.send('org.ziniki.Init', 'load', null);
	return handle;
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
	  var innerCard = this.createCard(line.card, html, line.services);
  } else if (tree.type == 'content') {
    html = doc.createElement("span");
    html.appendChild(doc.createTextNode(line.toString()));
  } else
	  throw new Error("Could not render " + line);
  // TODO: track the things we do in a cached state
  html.setAttribute('id', 'id_' + nextid++);
  if (tree.type === 'div') {
	if (tree.children) {
      for (var c=0;c<tree.children.length;c++) {
        this.renderSubtree(html, tree.children[c]);
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

FlasckProxy = function(wrapper, flctr) {
	this.wrapper = wrapper;
	this.flctr = flctr;
	this.chan = null; // will be filled in later
}

FlasckProxy.prototype.channel = function(chan) {
	this.chan = chan;
	this.flctr._onChan = chan.chan;
}

FlasckProxy.prototype.invoke = function(msg) {
//	console.log("msg = ", msg);
//	console.log("need to send to", this.flctr);
//	console.log("method = " + this.flctr[msg.method]);
	var msgs = FLEval.full(this.flctr[msg.method].apply(this.flctr, msg.args));
	this.wrapper.processMessages(msgs);
	this.wrapper.doRender(msgs);
}
