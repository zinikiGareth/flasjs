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
