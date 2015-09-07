var haveZiniki = true;
FlasckServices = {};

// Not really a service
FlasckServices.RenderService = function(postbox) {
	this.postbox = postbox;
	return this;
}

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
		self.postbox.deliver(handler.chan, {method: 'onTick', args:[] });
	}, 1000);
}

FlasckServices.KeyValueService = function(postbox) {
	this.postbox = postbox;
	this.store = {};
	return this;
}

FlasckServices.KeyValueService.prototype.process = function(message) {
//	console.log("received message", message);
	"use strict";
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

FlasckServices.KeyValueService.prototype.subscribe = function(resource, handler) {
	"use strict";
	var self = this;
//	console.log("self =", self, "subscribe to", resource);

	// I think extracting this is a hack
	var idx = resource.lastIndexOf('/');
	var prop = resource.substring(idx+1);
	if (self.store.hasOwnProperty(resource)) {
		// this 'null' represents the 'type' of the object
		setTimeout(function() { self.postbox.deliver(handler.chan, {method: 'update', args:[self.store[resource]]}); }, 0);
		return;
	}
	else if (self.store.hasOwnProperty(prop)) {
		// this 'null' represents the 'type' of the object
		setTimeout(function() { self.postbox.deliver(handler.chan, {method: 'update', args:[self.store[prop]]}); }, 0);
		return;
	}
	var zinchandler = function (msg) {
		console.log("kv received", msg, "from Ziniki");
		var main = msg.payload._main;
		for (var k in msg.payload) {
			if (k[0] !== '_' && msg.payload.hasOwnProperty(k)) {
				if (!main)
					main = k;
				var l = msg.payload[k];
				if (l instanceof Array) {
					for (var i=0;i<l.length;i++) {
						var it = l[i];
						self.store[it.id] = it;
					}
				}
			}
		}
		self.postbox.deliver(handler.chan, {method: 'update', args:[msg.payload[main][0]]});
	};
	if (haveZiniki) {
		// we can either subscribe to a resource or to a specific object by ID
		// we need to distinguish between these cases
		// for now we are putting the burden on the person asking for the object
		ZinikiConn.req.subscribe(resource, zinchandler).send();
	} else {
		self.postbox.deliver(handler.chan, {method: 'update', args:['hello, world']});
	}
}

FlasckServices.KeyValueService.prototype.save = function(obj) {
	"use strict";
	var self = this;
	if (haveZiniki) {
		var payload = {};
		var arr = payload['net.ziniki.perspocpoc.Block'] = [];
		var cvobj = {};
		for (var x in obj) {
			if (obj.hasOwnProperty(x) && obj[0] != '_' && !(obj[x] instanceof Array))
				cvobj[x] = obj[x];
		}
		arr.push(cvobj);
		console.log("saving payload", payload);
		ZinikiConn.req.invoke("update/net.ziniki.perspocpoc.Block/" + obj.id).setPayload(payload).send();
	} else {
		console.log("no Ziniki; but request to save object", obj);
	}
}
FlasckServices.CredentialsService = function(document, postbox) {
	this.doc = document;
	this.postbox = postbox;
	return this;
}

FlasckServices.CredentialsService.prototype.process = function(message) {
//	console.log("received message", message);
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this.service, message.args);
}

FlasckServices.CredentialsService.prototype.logout = function() {
	console.log("logout");
	var self = this;
	localStorage.removeItem("zintoken");
	this.doc.getElementById("flasck_login").showModal();
}

FlasckServices.QueryService = function(postbox, store) {
	this.postbox = postbox;
	this.store = store;
	return this;
}

FlasckServices.QueryService.prototype.process = function(message) {
//	console.log("received message", message);
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

FlasckServices.QueryService.prototype.scan = function(index, type, handler) {
	"use strict";
	console.log("scan", index, type, handler);
	var self = this;
	var zinchandler = function(msg) {
	    var payload = msg.payload;
	    console.log("scan payload =", payload);
	    if (!payload || !payload[type])
	    	return;
		var main = msg.payload._main;
		for (var k in msg.payload) {
			if (k[0] !== '_' && msg.payload.hasOwnProperty(k)) {
				if (!main)
					main = k;
				if (main !== 'Croset')
					throw new Error("I was expecting a croset ...");
				var l = msg.payload[k];
				if (k == 'Croset') {
					; // fine, dealt with below
				} else { // sideload actual objects
					if (l instanceof Array) {
						for (var i=0;i<l.length;i++) {
							var it = l[i];
							it._ctor = k;
							self.store[it.id] = it;
						}
					}
				}
			}
		}
		self.postbox.deliver(handler.chan, {method: 'keys', args:[msg.payload[main]]});
	}
	if (haveZiniki)
		ZinikiConn.req.subscribe(index, zinchandler).setOption("type", "wikipedia").send();
	else {
		setTimeout(function() {
            if (index.substring(index.length-9) === "/myqueues") {
                    self.postbox.deliver(handler.chan, {method: 'entry', args: ["13", new com.helpfulsidekick.chaddy.Queue('Q3', 'This Week')]}); 
                    self.postbox.deliver(handler.chan, {method: 'entry', args: ["31", new com.helpfulsidekick.chaddy.Queue('Q1', 'Captured Items')]}); 
                    self.postbox.deliver(handler.chan, {method: 'entry', args: ["29", new com.helpfulsidekick.chaddy.Queue('Q2', 'TODO Today')]}); 
                    self.postbox.deliver(handler.chan, {method: 'entry', args: ["55", new com.helpfulsidekick.chaddy.Queue('Q5', 'Chaddy bugs')]}); 
                    self.postbox.deliver(handler.chan, {method: 'entry', args: ["47", new com.helpfulsidekick.chaddy.Queue('Q4', 'Flasck Issues')]});
            } else if (index.substring(index.length-3) === "/Q3") {
                    self.postbox.deliver(handler.chan, {method: 'entry', args: ["17", new com.helpfulsidekick.chaddy.Task('I31', 'This Week #1')]}); 
            }
 	   }, 10);
	}
}

FlasckServices.provideAll = function(document, postbox, services) {
	"use strict";
	Flasck.provideService(postbox, services, "org.ziniki.Timer", new FlasckServices.TimerService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Render", new FlasckServices.RenderService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Credentials", new FlasckServices.CredentialsService(document, postbox));
	var kvs = new FlasckServices.KeyValueService(postbox);
	Flasck.provideService(postbox, services, "org.ziniki.KeyValue", kvs);
	Flasck.provideService(postbox, services, "org.ziniki.Query", new FlasckServices.QueryService(postbox, kvs.store));
}