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
	return this.services[name];
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
FlasckService.TimerService.prototype.requestTicks = function(handler, amount) {
	console.log("Add timer for handler", handler);
	console.log("interval should be every " + amount + "s");
}

// TODO: it seems wrong to me to have a "service" for a handler, but the logic as currently written requires it.
// TODO: sort this out when on my next refactor cycle
FlasckService.OnTickService = function() {
	this.clients = [];
	return this;
}
FlasckService.OnTickService.prototype.addClient = addClient;

// Clients are the "handles" connecting to the "proxy"; exists on the "real" side
FlasckClient = function(chan, svc) {
	this.chan = chan;
	this.service = svc;
	svc.addClient(this);
}

FlasckClient.prototype.request = function(msg) {
	console.log("service request for ", msg.method);
	console.log("args = ", msg.args);
	this.service[msg.method].apply(this.service, msg.args);
}

// This is the thing that "represents" the card on the container side
FlasckHandle = function(container) {
	this.container = container;
	this.conn = null;
	this.contracts = {};
	this.channels = {};
}

FlasckHandle.prototype.newChannel = function(chan, contract) {
	this.conn.dispatch[chan] = new FlasckClient(chan, this.container.getService(contract));
	this.channels[contract] = chan;
}

FlasckHandle.prototype.send = function(ctr, method /* args */) {
	var chan = this.channels[ctr];
	console.log("sending to " + chan);
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
	this.dispatch[0].request = function(newChanMsg) {
		self.handle.newChannel(newChanMsg.chan, newChanMsg.contract);
	}
}

DownConnection.prototype.newChannel = function(ctr, handler) {
	this.ctr = ctr;
	this.handler = handler;
	var ret = new Channel(this, this.chan, handler);
	this.dispatch[this.chan] = ret;
	this.up.deliver({ chan: 0, message: { chan: this.chan, contract: ctr }});
	this.chan += 2;
	return ret;
}

DownConnection.prototype.send = function(msg) {
	// we should clone this message
	msg = JSON.parse(JSON.stringify(msg));
	console.log(msg);
	this.up.deliver(msg);
//	console.log(this.dispatch, chan);
//	var hdlr = this.dispatch[chan];
//	console.log(hdlr);
//	console.log(hdlr[method]);
//	return FLEval.full(hdlr[method].apply(hdlr, argArray));
}

DownConnection.prototype.deliver = function(msg) {
	console.log("down deliver: ", this.dispatch, msg);
	this.dispatch[msg.chan].request(msg.message);
}

// UpConnection is in the "sandbox" and sends messages "Up" and receives and dispatches "Down" messages
UpConnection = function() {
	this.chan = 1;
	this.dispatch = {};
}

UpConnection.prototype.newChannel = function(ctr, handler) {
	console.log(ctr, handler);
	this.ctr = ctr;
	this.handler = handler;
	var ret = new Channel(this, this.chan, handler);
	this.dispatch[this.chan] = ret;
	this.down.deliver({ chan: 0, message: { chan: this.chan, contract: ctr }});
	this.chan += 2;
	return ret;
}

UpConnection.prototype.send = function(msg) {
	// we should clone this message
	console.log("sending message ", msg)
	msg = JSON.parse(JSON.stringify(msg));
	this.down.deliver(msg);
}

UpConnection.prototype.deliver = function(msg) {
	console.log("up deliver: ", this.dispatch[msg.chan].handler);
	this.dispatch[msg.chan].handler.invoke(msg.message);
}

// Channels inside the main connection
Channel = function(conn, chan, handler) {
	this.conn = conn;
	this.chan = chan;
	this.handler = handler;
}

Channel.prototype.send = function(method, args) {
	console.log("sending to " + this.chan);
	this.conn.send({ chan: this.chan, message: { method: method, args: args } });
}

// Card Side

// FlasckWrapper is the pseudo "environment" on the card side
// It presumably gets delivered a "connection"
FlasckWrapper = function(conn, serviceNames) {
	this.conn = conn;
	this.serviceNames = serviceNames;
	this.card = null; // will be filled in later
	return this;
}

FlasckWrapper.prototype.cardCreated = function(card) {
	this.card = card;
	this.proxies = {};
	for (var i=0;i<this.serviceNames.length;i++) {
		var s = this.serviceNames[i];
		var ctr = card.contracts[s];
		var proxy = this.proxies[s] = new FlasckProxy(this, ctr);
		proxy.channel(this.conn.newChannel(s, proxy));
		ctr._proxy = proxy;
	}
}

FlasckWrapper.prototype.getService = function(s) {
	return this.proxies[s];
}

FlasckWrapper.prototype.deliver = function(ctr, meth) { // and arguments
	var hdlr = this.card.contracts[ctr];
	console.log(hdlr);
	console.log(hdlr[meth]);
	var args = [];
	for (var i=2;i<arguments.length;i++)
		args[i-2] = arguments[i];
	return FLEval.full(hdlr[meth].apply(hdlr, args));
}

FlasckWrapper.prototype.processMessages = function(l) {
	while (l && l._ctor === 'Cons') {
		processOne(l.head);
		l = l.tail;
	}
}

var processOne = function(msg) {
	console.log("Message: ", msg);
	if (msg._ctor === 'Send') {
		var channel = msg.target._proxy.chan;
		var meth = msg.method;
//		var invoke = target.request;
		console.log("channel ", channel, channel instanceof Channel);
		console.log("meth " + meth);
//		console.log("invoke " + invoke);
		var args = FLEval.flattenList(msg.args);
		console.log(args);
		for (var p=0;p<args.length;p++) {
			var a = args[p];
			if (a._special) {
				if (!a._onchan) {
					if (a._special === 'handler')
						a._onchan = channel.conn.newChannel(a._contract, a).chan;
					else
						throw new Error("Cannot send an object of type " + a._special);
				}
				args[p] = { type: a._special, chan: a._onchan };
			}
		}
		console.log(args);
		channel.send(meth, args);
	}
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
	console.log("msg = ", msg);
	console.log("need to send to", this.flctr);
	console.log("method = " + this.flctr[msg.method]);
	var msgs = FLEval.full(this.flctr[msg.method].apply(this.flctr, msg.args));
	this.wrapper.processMessages(msgs);
}
