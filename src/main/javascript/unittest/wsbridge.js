function WSBridge(host, port) {
	this.ws = new WebSocket("ws://" + host + ":" + port + "/bridge");
	this.ws.addEventListener("message", ev => {
		console.log("message", ev);
	});
}

WSBridge.prototype.log = function(...args) {
	console.log(args);
}