/** A postbox is intended to be a mechanism for
 * delivering messages wherever they need to go,
 * local or remote
 * @param name the name of this postbox, to be used in generating unique names
 * @returns a new postbox
 */
Postbox = function(name, window) {
	"use strict";
	var self = this;
	this.name = name;
	this.recip = 0;
	this.postboxes = {};
	this.recipients = {};
	window.addEventListener("message", function(msg) { "use strict"; self.receiveMessage(msg) }, false);
	return this;
}

/** Create a new local-delivery address to be associated with a local component
 */
Postbox.prototype.newAddress = function() {
	return "" + (++this.recip);
}

Postbox.prototype.unique = function(addr) {
	return this.name + ":" + addr;
}

/** Declare a remote postbox
 * @param name the name of the remote postbox
 * @param onConnect a function to call when the postbox connects
 */
Postbox.prototype.remote = function(name, onConnect) {
	if (this.postboxes[name] && this.postboxes[name].window) {
		setTimeout(function() { onConnect(name) }, 0);
	} else {
		this.postboxes[name] = { onConnect: onConnect };
	}
}

/** Connect a remote postbox
 * @param name the name of the remote postbox
 * @param pbox a window handle for the remote postbox
 */
Postbox.prototype.connect = function(name, atWindow) {
	this.postboxes[name] = { window: atWindow };	
	atWindow.postMessage({action:'connect',from:this.name}, "*");
}

Postbox.prototype.receiveMessage = function(msg) {
	console.log("received", msg.data);
	if (!msg.data.action)
		throw new Error("Message did not have an action");
	if (msg.data.action === "connect") {
		var name = msg.data.from;
		if (this.postboxes[name] && this.postboxes[name].onConnect) {
			this.postboxes[name].window = msg.source;
			this.postboxes[name].onConnect(name);
			delete this.postboxes[name].onConnect;
		} else {
			this.postboxes[name] = { window: msg.source };
		}

		// It's this that I deny
//		msg.source.postMessage({action:"accepted",from:this.name}, "*");
	}
}

/** Register a local component
 * @param address the local address to be used to find the component
 * @param comp the physical component to deliver to (service, impl or handler)
 */
Postbox.prototype.register = function(address, comp) {
	this.recipients[address] = comp;
}

/** Deliver a message to an address
 * @param address the local or remote address to deliver to
 * @param invocation the invocation message to deliver to the address and invoke on the target component 
 */
Postbox.prototype.deliver = function(address, message) {
//	console.log("deliver ", message, " to ", address);
	var idx = address.lastIndexOf(":");
	var pb = address.substr(0, idx);
	var addr = address.substr(idx+1);
	if (this.name !== pb)
		throw new Error("I don't know how to deliver to remote postboxes yet");
	var recip = this.recipients[addr];
	if (!recip)
		throw new Error("There is no registered recipient for " + address);
	if (!recip.process)
		console.log("There is no process method on", recip);
	recip.process(message);
}