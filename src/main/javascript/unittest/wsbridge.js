function WSBridge(host, port) {
	var self = this;
	this.ws = new WebSocket("ws://" + host + ":" + port + "/bridge");
	this.waitcount = 1;
	this.requestId = 1;
	this.sending = [];
	this.lockedOut = [];
	this.responders = {};
	this.ws.addEventListener("open", ev => {
		console.log("connected", ev);
		while (this.sending.length > 0) {
			var v = this.sending.shift();
			this.ws.send(v);
		}
	});
	this.ws.addEventListener("message", ev => {
		console.log("message", ev.data);
		var msg = JSON.parse(ev.data);
		var action = msg.action;
		if (action == "response") {
			var rid = msg.respondingTo;
			if (!this.responders[rid]) {
				console.log("there is nobody willing to handle response " + rid);
				return;
			}
			this.responders[rid].call(this, msg);
			delete this.responders[rid];
		} else {
			if (!WSBridge.handlers[action]) {
				console.log("there is no handler for " + action);
				return;
			}
			WSBridge.handlers[action].call(self, msg);
		}
	});
}
WSBridge.handlers = {};

WSBridge.prototype.log = function(...args) {
	console.log.apply(console.log, args);
}

WSBridge.prototype.debugmsg = function(...args) {
	console.log.apply(console.log, args);
}

WSBridge.prototype.module = function(moduleName) {
	this.send({action: "module", "name": moduleName });
	this.lock("bindModule");
}

WSBridge.handlers['haveModule'] = function(msg) {
	var name = msg.name;
	var clz = window[msg.clz];
	var conn = msg.conn;

	console.log("have connection for module", this, name, clz);
	this.runner.bindModule(name, new clz(this, conn));
	this.unlock("haveModule");
}

WSBridge.prototype.send = function(json) {
	var text = JSON.stringify(json);
	if (this.ws.readyState == this.ws.OPEN)
		this.ws.send(text);
	else
		this.sending.push(text)
}

WSBridge.prototype.connectToZiniki = function(wsapi, cb) {
	runner.broker.connectToServer('ws://' + host + ':' + port + '/wsapi/token/secret');
}

WSBridge.prototype.executeSync = function(runner, st, cxt, steps) {
	this.runner = runner;
	this.st = st;
	this.runcxt = cxt;
	this.readysteps = steps;
	this.unlock("ready to go"); // unlocks the initial "1" we set in constructor
}

WSBridge.prototype.nextRequestId = function(hdlr) {
	this.responders[this.requestId] = hdlr;
	return this.requestId++;
}

WSBridge.prototype.lock = function(msg) {
	this.waitcount++;
	console.log("lock   waitcount = " + this.waitcount, msg);
}

WSBridge.prototype.unlock = function(msg) {
	--this.waitcount;
	console.log("unlock waitcount = " + this.waitcount, msg);
	if (this.waitcount == 0) {
		console.log(new Date() + " ready to go");
		this.gotime();
	}
}

WSBridge.prototype.onUnlock = function(f) {
	this.lockedOut.push(f);
}

WSBridge.prototype.gotime = function() {
	if (this.readysteps.length == 0) {
		// we're done
		console.log("test complete");
		return;
	}
	if (this.waitcount > 0) {
		console.log("cannot go because lock count is", this.waitcount);
		return; // we are in a holding pattern
	}
	if (this.lockedOut.length  > 0) {
		console.log("handling locked out callback");
		this.lock("a callback");
		this.lockedOut.shift().call(this);
		return;
	}
	var s = this.readysteps.shift();
	console.log(new Date() + " executing step", s);
	this.lock("around step");
	this.st[s].call(this.st, this.runcxt);
	this.send({action: "step"});
}

WSBridge.handlers["stepdone"] = function(msg) {
	this.unlock("around step");
}