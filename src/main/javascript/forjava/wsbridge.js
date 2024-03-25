import { JavaLogger } from "./javalogger.js";
import { UTRunner } from "../unittest/flastest.js";

// Connect to ChromeTestRunner
function WSBridge(host, port) {
	var self = this;
	this.tests = {};
	this.runner = new UTRunner(this);
	this.currentTest = null;
	this.ws = new WebSocket("ws://" + host + ":" + port + "/bridge");
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

WSBridge.prototype.addtest = function(name, test) {
	this.tests[name] = test;
}

WSBridge.prototype.log = function(...args) {
	console.log.apply(console.log, args);
}

WSBridge.prototype.debugmsg = function(...args) {
	console.log.apply(console.log, args);
}

WSBridge.prototype.module = function(runner, moduleName) {
	this.runner = runner;
	this.send({action: "module", "name": moduleName });
	this.lock("bindModule");
	return 'must-wait';
}

WSBridge.handlers['haveModule'] = function(msg) {
	var name = msg.name;
	var clz = window[msg.clz];
	var conn = msg.conn;

	console.log("have connection for module", this, name, clz);
	this.runner.bindModule(name, new clz(this, conn));
	this.unlock("haveModule");
}

WSBridge.handlers['prepareTest'] = function(msg) {
	console.log("run unit test", msg);
	var cxt = this.runner.newContext();
	var utf = this.tests[msg.wrapper][msg.testname];
	this.currentTest = new utf(this.runner, cxt);
	this.runner.clear();
	var steps = this.currentTest.dotest.call(this.currentTest, cxt);
	this.send({action:"steps", steps: steps});
}

WSBridge.handlers['runStep'] = function(msg) {
	console.log("run unit test step", msg);
	try {
		var cxt = this.runner.newContext();
		var step = this.currentTest[msg.step];
		step.call(this.currentTest, cxt);
		this.unlock();
	} catch (e) {
		console.log(e);
		this.send({ action: "error", error: e.toString() });
	}
}

WSBridge.handlers['assertSatisfied'] = function(msg) {
	console.log("assert all expectations satisfied", msg);
	try {
		this.runner.assertSatisfied();
		this.unlock();
	} catch (e) {
		console.log(e);
		this.send({ action: "error", error: e.toString() });
	}
}

WSBridge.prototype.send = function(json) {
	var text = JSON.stringify(json);
	if (this.ws.readyState == this.ws.OPEN)
		this.ws.send(text);
	else
		this.sending.push(text)
}

WSBridge.prototype.connectToZiniki = function(wsapi, cb) {
	runner.broker.connectToServer('ws://' + host + ':' + port);
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

WSBridge.prototype.lock = function() {
	this.send({action: "lock"});
}

WSBridge.prototype.unlock = function(msg) {
	this.send({action: "unlock"});
}

export { JavaLogger, WSBridge };