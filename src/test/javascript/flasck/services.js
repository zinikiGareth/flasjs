FlasckServices = {};

FlasckServices.TimerService = function() {
	return this;
}

FlasckServices.TimerService.prototype.requestTicks = function(client, handler, amount) {
//	console.log("Add timer for handler", handler);
//	console.log("interval should be every " + amount + "s");
	setInterval(function() {
		client.handle.sendTo(handler.chan, "onTick")
	}, 1000);
}