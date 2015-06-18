FlasckServices = {};

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