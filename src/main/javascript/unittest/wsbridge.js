function WSBridge(host, port) {
	this.ws = new WebSocket("ws://" + host + ":" + port + "/bridge");
	this.sending = [];
	this.ws.addEventListener("open", ev => {
		console.log("connected", ev);
		while (this.sending.length > 0) {
			var v = this.sending.shift();
			this.ws.send(v);
		}
	});
	this.ws.addEventListener("message", ev => {
		console.log("message", ev);
	});
}

WSBridge.prototype.log = function(...args) {
	console.log(args);
}

WSBridge.prototype.module = function(moduleName) {
	this.send({action: "module", "name": moduleName });
	return new WSBridgeModule(this, moduleName);
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
	this.gotime();
}

WSBridge.prototype.gotime = function() {
	if (this.readysteps.length == 0)
		return; // we're done
	if (this.waitcount > 0)
		return; // we are in a holding pattern
	var s = this.readysteps.shift();
	this.st[s].call(this.st, this.runcxt);
}

// we have to create this before we get the response because of syncrhonization issues
// but then when the response comes we need to tie the two together
function WSBridgeModule(bridge, name) {

}