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
	"use strict"
	return "" + (++this.recip);
}

Postbox.prototype.unique = function(addr) {
	"use strict"
	return this.name + ":" + addr;
}

/** Declare a remote postbox
 * @param name the name of the remote postbox
 * @param onConnect a function to call when the postbox connects
 */
Postbox.prototype.remote = function(name, onConnect) {
	"use strict"
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
	"use strict"
	this.postboxes[name] = { window: atWindow };	
	atWindow.postMessage({action:'connect',from:this.name}, "*");
}

Postbox.prototype.receiveMessage = function(msg) {
	"use strict"
//	console.log("received", msg.data);
	if (!msg.data.from)
		throw new Error("Message did not have a from address");
	if (!msg.data.action)
		throw new Error("Message did not have an action");
	var from = msg.data.from;
	if (msg.data.action === "connect") {
		if (this.postboxes[from] && this.postboxes[from].onConnect) {
			this.postboxes[from].window = msg.source;
			this.postboxes[from].onConnect(from);
			delete this.postboxes[from].onConnect;
		} else {
			this.postboxes[from] = { window: msg.source };
		}
	} else if (msg.data.action === "data") {
		if (!this.postboxes[from] || !this.postboxes[from].window)
			throw new Error("Received data message before connect, should queue");
		console.log(this.name, "needs to process data message", msg.data.message, "at", msg.data.to);
		this.deliver(msg.data.to, msg.data.message);
	} else
		throw new Error("Cannot handle action " + msg.data.action);
}

/** Register a local component
 * @param address the local address to be used to find the component
 * @param comp the physical component to deliver to (service, impl or handler)
 */
Postbox.prototype.register = function(address, comp) {
	"use strict"
	this.recipients[address] = comp;
}

/** Remove a local component
 */
Postbox.prototype.remove = function(address) {
	"use strict"
	var idx = address.lastIndexOf(":");
	var pb = address.substr(0, idx);
	var addr = address.substr(idx+1);
	delete this.recipients[addr];
}

/** Deliver a message to an address
 * @param address the local or remote address to deliver to
 * @param invocation the invocation message to deliver to the address and invoke on the target component 
 */
Postbox.prototype.deliver = function(address, message) {
	"use strict"
//	console.log("deliver", message, "to", address);
	var idx = address.lastIndexOf(":");
	var pb = address.substr(0, idx);
	var addr = address.substr(idx+1);
	if (this.name !== pb) {
		var rpb = this.postboxes[pb];
		if (!rpb || !rpb.window)
			throw new Error("I think this should now put things in a queue"); 
		rpb.window.postMessage({action:'data', from: this.name, to: address, message: message}, "*");
		return;
	}
	var recip = this.recipients[addr];
	if (!recip) {
		console.log("There is no registered recipient for ", address);
		return;
	}
	if (!recip.process)
		throw new Error("There is no process method on" + recip);
	recip.process(message);
}