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
//	console.log("scan", index, type, handler);
	var self = this;
	// Hack - this should turn around and talk to Ziniki
	setTimeout(function() {
		self.postbox.deliver(handler.chan, {method: 'entry', args: ["Q7", new com.helpfulsidekick.chaddy.Queue('Q7', 'Captured Items')]}); 
	}, 10);
}

FlasckServices.provideAll = function(postbox, services) {
	"use strict";
	Flasck.provideService(postbox, services, "org.ziniki.Timer", new FlasckServices.TimerService());
	Flasck.provideService(postbox, services, "org.ziniki.Render", new FlasckServices.RenderService());
	Flasck.provideService(postbox, services, "org.ziniki.Query", new FlasckServices.QueryService());
}