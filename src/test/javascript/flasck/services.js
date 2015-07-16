FlasckServices = {};

// Not really a service
FlasckServices.RenderService = function(postbox) {
	this.postbox = postbox;
	return this;
}

FlasckServices.TimerService = function(postbox) {
	this.postbox = postbox;
	return this;
}

FlasckServices.TimerService.prototype.process = function(message) {
	this.requestTicks(message.args[0], message.args[1], message.args[2]);
}

FlasckServices.TimerService.prototype.requestTicks = function(handler, amount) {
	var self = this;
//	console.log("Add timer for handler", handler, amount);
//	console.log("interval should be every " + amount + "s");
	setInterval(function() {
		self.postbox.deliver(handler.chan, {method: 'onTick'});
	}, 1000);
}

FlasckServices.KeyValueService = function(postbox) {
	this.postbox = postbox;
	return this;
}

FlasckServices.QueryService = function(postbox) {
	this.postbox = postbox;
	return this;
}

FlasckServices.QueryService.prototype.process = function(message) {
//	console.log("received message", message);
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this.service, message.args);
}

FlasckServices.QueryService.prototype.scan = function(index, type, handler) {
	console.log("scan", index, type, handler);
	var self = this;
	// Hack - this should turn around and talk to Ziniki
	setTimeout(function() {
		if (index.substring(index.length-9) === "/myqueues") {
			self.postbox.deliver(handler.chan, {method: 'entry', args: ["13", new com.helpfulsidekick.chaddy.Queue('Q3', 'This Week')]}); 
			self.postbox.deliver(handler.chan, {method: 'entry', args: ["31", new com.helpfulsidekick.chaddy.Queue('Q1', 'Captured Items')]}); 
			self.postbox.deliver(handler.chan, {method: 'entry', args: ["29", new com.helpfulsidekick.chaddy.Queue('Q2', 'TODO Today')]}); 
			self.postbox.deliver(handler.chan, {method: 'entry', args: ["55", new com.helpfulsidekick.chaddy.Queue('Q5', 'Chaddy bugs')]}); 
			self.postbox.deliver(handler.chan, {method: 'entry', args: ["47", new com.helpfulsidekick.chaddy.Queue('Q4', 'Flasck Issues')]});
		} else if (index.substring(index.length-3) === "/Q3") {
			console.log("Q3");
			self.postbox.deliver(handler.chan, {method: 'entry', args: ["17", new com.helpfulsidekick.chaddy.Task('I31', 'This Week #1')]}); 
		}
	}, 10);
}

FlasckServices.provideAll = function(postbox, services) {
	"use strict";
	Flasck.provideService(postbox, services, "org.ziniki.Timer", new FlasckServices.TimerService());
	Flasck.provideService(postbox, services, "org.ziniki.Render", new FlasckServices.RenderService());
	Flasck.provideService(postbox, services, "org.ziniki.Query", new FlasckServices.QueryService());
}