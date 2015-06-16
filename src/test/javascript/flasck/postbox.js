/** A postbox is intended to be a mechanism for
 * delivering messages wherever they need to go,
 * local or remote
 * @param name the name of this postbox, to be used in generating unique names
 * @returns a new postbox
 */
Postbox = function(name) {
	this.name = name;
	this.recip = 0;
	this.postboxes = {};
	this.recipients = {};
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

/** Connect a remote postbox
 * @param name the name of the remote postbox
 * @param pbox a window handle for the remote postbox
 */
Postbox.prototype.connect = function(name, pbox) {
	this.postboxes[name] = pbox;
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
	console.log("deliver ", message, " to ", address);
	var idx = address.lastIndexOf(":");
	var pb = address.substr(0, idx);
	var addr = address.substr(idx+1);
	if (this.name !== pb)
		throw new Error("I don't know how to deliver to remote postboxes yet");
	var recip = this.recipients[addr];
	var meth = recip[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	message.args.splice(0, 0, message.from);
	meth.apply(recip, message.args);
}