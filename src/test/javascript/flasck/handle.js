// This is the thing that "represents" the card on the container side
FlasckHandle = function(postbox, myAddr) {
	this._ctor = 'FlasckHandle';
	this.postbox = postbox;
	this.myAddr = myAddr;
	this.channels = {};
}

FlasckHandle.prototype.send = function(ctr, method /* args */) {
	if (!this.channels[ctr])
		throw new Error("There is no channel for contract " + ctr);
	var chan = this.channels[ctr];
	console.log("sending to " + chan);
	var args = [];
	for (var i=2;i<arguments.length;i++)
		args[i-2] = arguments[i];
//	this.conn.send({ chan: chan, message: { method: method, args: args } });
	this.postbox.deliver(chan, { from: this.myAddr, method: method, args: args });
}

FlasckHandle.prototype.redrawInto = function(into) {
	if (this.channels['org.ziniki.Render'])
		this.send('org.ziniki.Render', "render", {into: into});
//		postbox.deliver(this.channels['org.ziniki.Render'], {from: this.myAddr, method: "render", args: [{into: inside}] });
}