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
		self.postbox.deliver(handler.chan, {method: 'onTick'});
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
	console.log("self =", self, "subscribe to", resource);
	if (self.store.hasOwnProperty(resource)) {
		self.postbox.deliver(handler.chan, {method: 'update', args:[self.store[resource]]});
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
		self.postbox.deliver(handler.chan, {method: 'update', args:[main, msg.payload[main][0]]});
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

FlasckServices.QueryService = function(postbox) {
	this.postbox = postbox;
	return this;
}

FlasckServices.QueryService.prototype.process = function(message) {
//	console.log("received message", message);
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this.service, message.args);
}

FlasckServices.QueryService.prototype.scan = function(index, type, handler) {
	console.log("scan", index, type, handler);
	var self = this;
	var zinchandler = function(msg) {
	    var payload = msg.payload;
	    if (!payload || !payload[type])
	    	return;
	    payload[type].forEach(function (item) {
			item._ctor = type;		    
			self.postbox.deliver(handler.chan, {method: 'entry', args: [item.id, item]}); 
		});
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
	Flasck.provideService(postbox, services, "org.ziniki.KeyValue", new FlasckServices.KeyValueService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Query", new FlasckServices.QueryService(postbox));
}