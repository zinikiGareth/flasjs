// This is the thing that "represents" the card on the container side
FlasckHandle = function(postbox, myAddr) {
	this._ctor = 'FlasckHandle';
	this._isDisposed = false;
	this.postbox = postbox;
	this.myAddr = myAddr;
	this.channels = {};
	this.pending = [];
}

FlasckHandle.prototype.send = function(ctr, method /* args */) {
	var args = [];
	for (var i=2;i<arguments.length;i++)
		args[i-2] = arguments[i];
	var msg = { from: this.myAddr, method: method, args: args };
	if (this.pending) { // we can't send messages until established, so just queue them in order
		msg.ctr = ctr;
		this.pending.push(msg);
		return;
	}
	if (!this.channels[ctr])
		throw new Error("There is no channel for contract " + ctr);
	var chan = this.channels[ctr];
	this.postbox.deliver(chan, msg);
}

FlasckHandle.prototype.redrawInto = function(into) {
	if (this.channels['org.flasck.Render']) {
		var msg = {};
		if (this.postbox.isLocal(this.channels['org.flasck.Render']))
			msg.into = into;
		// TODO: it seems the remote case needs something more here, but not quite sure what
		// might be on the other side
		this.send('org.flasck.Render', "render", msg);
	}
}

FlasckHandle.prototype.dispose = function() {
	this._isDisposed = true;
	if (this.channels['org.flasck.Init'])
		this.send('org.flasck.Init', 'dispose');
	this.postbox.remove(this.myAddr);
}