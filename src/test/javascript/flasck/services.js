FlasckServices = {};

FlasckServices.TimerService = function() {
	return this;
}

FlasckServices.TimerService.prototype.process = function(message) {
	this.requestTicks(message.args[0], message.args[1], message.args[2]);
}

FlasckServices.TimerService.prototype.requestTicks = function(client, handler, amount) {
//	console.log("Add timer for handler", handler);
//	console.log("interval should be every " + amount + "s");
	setInterval(function() {
		client.handle.sendTo(handler.chan, "onTick")
	}, 1000);
}