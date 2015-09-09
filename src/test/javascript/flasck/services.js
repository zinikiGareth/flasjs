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

FlasckServices.CentralStore = {
	keyValue: {_hack: 'keyvalue'},
	personae: {_hack: 'personae'},
	crosets: {_hack: 'crosets'}
};

FlasckServices.KeyValueService = function(postbox) {
	this.postbox = postbox;
	this.store = FlasckServices.CentralStore.keyValue;
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

FlasckServices.KeyValueService.prototype.typed = function(type, id, handler) {
	"use strict";
	var self = this;
	if (self.store.hasOwnProperty(id)) {
		var obj = self.store[id];
		self.postbox.deliver(handler.chan, {method: 'update', args:[obj]});
		return;
	}

	var resource = 'typedObject/' + type + '/' + id;
	console.log("self =", self, "subscribe to", resource);

	if (self.store.hasOwnProperty(resource)) {
		var obj = self.store[resource];
		self.postbox.deliver(handler.chan, {method: 'update', args:[obj]});
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
						if (!it._ctor)
							it._ctor = main;
						self.store[it.id] = it;
					}
				}
			}
		}
		var obj = msg.payload[main][0];
		self.postbox.deliver(handler.chan, {method: 'update', args:[obj]});
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

FlasckServices.KeyValueService.prototype.resource = function(resource, handler) {
	"use strict";
	var self = this;
	console.log("self =", self, "subscribe to", resource);

	if (self.store.hasOwnProperty(resource)) {
		var obj = self.store[resource];
		self.postbox.deliver(handler.chan, {method: 'update', args:[obj]});
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
						if (!it._ctor)
							it._ctor = main;
						self.store[it.id] = it;
					}
				}
			}
		}
		var obj = msg.payload[main][0];
		self.postbox.deliver(handler.chan, {method: 'update', args:[obj]});
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
		var cvobj = {};
		for (var x in obj) {
			if (obj.hasOwnProperty(x) && x[0] != '_' && !(obj[x] instanceof Array) && typeof obj[x] !== 'object')
				cvobj[x] = obj[x];
		}
		var payload = {};
		payload[obj._ctor] = [cvobj];
		console.log("saving payload", JSON.stringify(payload));
		ZinikiConn.req.invoke("update/" + obj._ctor + "/" + obj.id).setPayload(payload).send();
	} else {
		console.log("no Ziniki; but request to save object", obj);
	}
}

FlasckServices.CrosetService = function(postbox) {
	this.postbox = postbox;
	this.store = FlasckServices.CentralStore.crosets;
	return this;
}

FlasckServices.CrosetService.prototype.process = function(message) {
//	console.log("received message", message);
	"use strict";
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

// This is obviously a minimalist hack
FlasckServices.CrosetService.prototype.range = function(croId, from, to, handler) {
	"use strict";
	var self = this;
	setTimeout(function() {
		var obj = self.store['personaCroset'];
		self.postbox.deliver(handler.chan, {method: 'update', args:[obj]});
	}, 0);
}

FlasckServices.PersonaService = function(postbox) {
	"use strict";
	this.postbox = postbox;
	this.store = FlasckServices.CentralStore.personae;
	return this;
}

FlasckServices.PersonaService.prototype.process = function(message) {
//	console.log("received message", message);
	"use strict";
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

FlasckServices.PersonaService.prototype.forApplication = function(appl, type, handler) {
	"use strict";
	var self = this;
	var resource = 'personafor/' + appl +'/' + type;
	console.log("self =", self, "subscribe to", resource);

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
						if (!it._ctor)
							it._ctor = main;
						self.store[it.id] = it;
					}
				}
			}
		}
		var obj = msg.payload[main][0];
		// HACK! - to work around Ziniki not doing Crosets yet ...
		if (main === 'net.ziniki.perspocpoc.PocpocPersona') {
			var blocks = obj['blocks'];
			obj['blocks'] = {id: 'personaCroset'};
			if (!FlasckServices.CentralStore.crosets['personaCroset']) {
				var key = 100;
				for (var i=0;i<blocks.length;i++) {
					blocks[i]._ctor = 'Crokey';
					blocks[i]['key'] = "" + (key+10*i);
				}
				FlasckServices.CentralStore.crosets['personaCroset'] = {id: 'personaCroset', _ctor: 'Crokeys', keys: blocks }; // this may not be quite right ...
			}
		}
		self.postbox.deliver(handler.chan, {method: 'update', args:[obj]});
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

FlasckServices.PersonaService.prototype.save = function(obj) {
	"use strict";
	if (haveZiniki) {
		var cvobj = {};
		for (var x in obj) {
			if (obj.hasOwnProperty(x) && x[0] != '_' && !(obj[x] instanceof Array) && typeof obj[x] !== 'object')
				cvobj[x] = obj[x];
		}
		var payload = {};
		payload[obj._ctor] = [cvobj];
		console.log("saving payload", JSON.stringify(payload));
		ZinikiConn.req.invoke("updatePersona/" + obj._ctor + "/" + obj.id).setPayload(payload).send();
	} else {
		console.log("no Ziniki; but request to save persona", obj);
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
	this.store = FlasckServices.CentralStore.keyValue;
	return this;
}

FlasckServices.QueryService.prototype.process = function(message) {
//	console.log("received message", message);
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

FlasckServices.QueryService.prototype.scan = function(index, type, options, handler) {
	"use strict";
	console.log("scan", index, type, options, handler);
	var self = this;
	var zinchandler = function(msg) {
	    var payload = msg.payload;
	    console.log("scan payload =", payload);
	    if (!payload || !payload[type])
	    	return;
		var main = msg.payload._main;
		var crokeys = { _ctor: 'Crokeys', keys: [] };
		for (var k in msg.payload) {
			if (k[0] !== '_' && msg.payload.hasOwnProperty(k)) {
				if (!main)
					main = k;
				if (main !== 'Croset')
					throw new Error("I was expecting a croset ...");
				var l = msg.payload[k];
				if (k == 'Croset') {
					for (var i=0;i<l.length;i++)
						crokeys.keys[i] = l[i];
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
		self.postbox.deliver(handler.chan, {method: 'keys', args:[crokeys]});
	}
	if (haveZiniki) {
		var req = ZinikiConn.req.subscribe(index, zinchandler);
		// options should really be a map and processed as such ...
		// req.setOption("type", "wikipedia");
		var idx;
		while ((idx = options.indexOf('=')) != -1) {
			var key = options.substring(0, idx);
			var i2 = options.indexOf('=', idx+1);
			var val;
			if (i2 == -1) {
				val = options.substring(idx+1);
				options = "";
			} else {
				val = options.substring(idx+1, i2);
				options = options.substring(i2+1);
			}
			req.setOption(key, val);
		}
		req.send();
	} else {
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
	Flasck.provideService(postbox, services, "org.ziniki.Croset", new FlasckServices.CrosetService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Persona", new FlasckServices.PersonaService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Query", new FlasckServices.QueryService(postbox));
}