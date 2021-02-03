function WSBridge(host, port) {
	var self = this;
	this.ws = new WebSocket("ws://" + host + ":" + port + "/bridge");
	this.waitcount = 1;
	this.sending = [];
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
		if (!WSBridge.handlers[action]) {
			console.log("there is no handler for " + action);
			return;
		}
		WSBridge.handlers[action].call(self, msg);
	});
}
WSBridge.handlers = {};

WSBridge.prototype.log = function(...args) {
	console.log(args);
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

WSBridge.prototype.executeSync = function(runner, st, cxt, steps) {
	this.runner = runner;
	this.st = st;
	this.runcxt = cxt;
	this.readysteps = steps;
	this.unlock("ready to go"); // unlocks the initial "1" we set in constructor
}

WSBridge.prototype.lock = function(msg) {
	this.waitcount++;
	console.log("lock   waitcount = " + this.waitcount, msg);
}

WSBridge.prototype.unlock = function(msg) {
	--this.waitcount;
	console.log("unlock waitcount = " + this.waitcount, msg);
	if (this.waitcount == 0) {
		this.gotime();
	}
}

WSBridge.prototype.gotime = function() {
	if (this.readysteps.length == 0)
		return; // we're done
	if (this.waitcount > 0)
		return; // we are in a holding pattern
	var s = this.readysteps.shift();
	console.log("executing step", s);
	this.lock("around step");
	this.st[s].call(this.st, this.runcxt);
	this.unlock("around step");
}
