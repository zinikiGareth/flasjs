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
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'onTick', args:[] });
	}, 1000);
}

FlasckServices.CentralStore = {
	keyValue: {_hack: 'keyvalue', _localMapping: {}},
	personae: {_hack: 'personae'},
	crokeys: {_hack: 'crokeys'}
};

FlasckServices.CentralStore.realId = function(id) {
	if (id[0] != '_' || id[1] != '_')
		return id;
	return FlasckServices.CentralStore.keyValue._localMapping[id];
}

FlasckServices.CentralStore.unpackPayload = function(store, payload) {
	var main = payload._main;
	for (var k in payload) {
		if (k[0] !== '_' && payload.hasOwnProperty(k)) {
			if (!main)
				main = k;
			var l = payload[k];
			if (l instanceof Array) {
				for (var i=0;i<l.length;i++) {
					var it = l[i];
					if (!it._ctor)
						it._ctor = main;
					store[it.id] = it;
				}
			}
		}
	}
	return payload[main][0];
}

FlasckServices.KeyValueService = function(postbox) {
	this.postbox = postbox;
	this.store = FlasckServices.CentralStore.keyValue;
	this.nextLocal = 1;
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

FlasckServices.KeyValueService.prototype.create = function(type, handler) {
	var self = this;
	var id = '__' + (self.nextLocal++)
	var letMeCreate = { _ctor: type, id: id };
	self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'itemCreated', args:[letMeCreate]});
	// NOTE: we should now close "handler.chan" because it has served its purpose
	

	if (haveZiniki) {
		var zinchandler = function (msg) {
			console.log("kv received", msg, "from Ziniki for local id", id);
			var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
			self.store._localMapping[id] = obj.id;
			// still to do:
			// 3. notify my KV client (not the handler) of an ID change
		};

		var payload = {};
		payload[type] = [{}];

		var resource = 'create/' + type;
		var req = ZinikiConn.req.invoke(resource, zinchandler);
		req.setPayload(payload);
		req.send();
	}
	
}

FlasckServices.KeyValueService.prototype.typed = function(type, id, handler) {
	"use strict";
	var self = this;
	if (self.store.hasOwnProperty(id)) {
		var obj = self.store[id];
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		return;
	}

	var resource = 'typedObject/' + type + '/' + id;
	console.log("self =", self, "subscribe to", resource);

	if (self.store.hasOwnProperty(resource)) {
		var obj = self.store[resource];
//		setTimeout(function() { // this really needs to be in postbox.  Fix whatever the other problem is!
			self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
//		}, 0);
		return;
	}
	var zinchandler = function (msg) {
		console.log("kv received", msg, "from Ziniki");
		var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
	};
	if (haveZiniki) {
		// we can either subscribe to a resource or to a specific object by ID
		// we need to distinguish between these cases
		// for now we are putting the burden on the person asking for the object
		ZinikiConn.req.subscribe(resource, zinchandler).send();
	} else {
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:['hello, world']});
	}
}

FlasckServices.KeyValueService.prototype.resource = function(resource, handler) {
	"use strict";
	var self = this;
	console.log("self =", self, "subscribe to", resource);

	if (self.store.hasOwnProperty(resource)) {
		var obj = self.store[resource];
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		return;
	}
	var zinchandler = function (msg) {
		console.log("kv received", msg, "from Ziniki");
		var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
	};
	if (haveZiniki) {
		// we can either subscribe to a resource or to a specific object by ID
		// we need to distinguish between these cases
		// for now we are putting the burden on the person asking for the object
		ZinikiConn.req.subscribe(resource, zinchandler).send();
	} else {
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:['hello, world']});
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
		var id = FlasckServices.CentralStore.realId(obj.id);
		if (!id) {
			// in this case, we haven't yet seen a real id back from Ziniki (or possibly it was so long ago that we've forgotten about it)
			// what we need to do is to park this record somewhere waiting for the rewrite event to occur and when it does, turn around and save the object
			// in the meantime, we should at least cache this value locally and notify other local clients ... when that code is written
			console.log("difficult case still to be handled ... see comment");
			return;
		}
		obj.id = id;
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
	this.store = FlasckServices.CentralStore.crokeys;
	return this;
}

// TODO: we should probably have a resource that is like croset/{id}/updates
// that tells us about things that we are interested in.
// It possibly is simply enough to say "range", I don't know ...

FlasckServices.CrosetService.prototype.process = function(message) {
//	console.log("received message", message);
	"use strict";
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

FlasckServices.CrosetService.prototype.get = function(crosetId, after, count, handler) {
	"use strict";
	var self = this;
	var zinchandler = function (msg) {
		console.log("croset received", msg, "from Ziniki");
		var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
	};
	ZinikiConn.req.subscribe("croset/" + crosetId + "/get/" + after + "/" + count, zinchandler).send();
}

// This is obviously a minimalist hack
FlasckServices.CrosetService.prototype.range = function(croId, from, to, handler) {
	"use strict";
	throw new Error("This minimalist hack is now too hacky to be useful (see personaCroset); if you use it, fix it");
	var self = this;
	setTimeout(function() {
		var obj = self.store['personaCroset'];
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
	}, 0);
}

FlasckServices.CrosetService.prototype.insert = function(crosetId, key, objId) {
	"use strict";
	var self = this;
	var sendId = FlasckServices.CentralStore.realId(objId);
	if (!sendId) {
		// I think in this case we need to try and remember that we should do this and get a callback
		// when we have the real ID.  This gets more complex as time goes by, because you end up changing
		// the thing you inserted and everything, so you probably need to consolidate those changes
		// for now, just keep retrying until it is here :-)
		console.log("We don't have a real id for this yet; deferred case handling needed");
		setTimeout(function() { self.insert(crosetId, key, objId); }, 150);
		return;
	}
	var croset = this.store[crosetId];
	if (!croset)
		throw new Error("There is no croset for" + crosetId);
	// de dup
	for (var i=0;i<croset.keys.length;i++) {
		if (croset.keys[i].id === sendId)
			return; // it's a duplicate
	}
	var payload = {};
	payload['org.ziniki.ID'] = [{id: sendId}];
	ZinikiConn.req.invoke("croset/" + crosetId + "/insertAround/" + key).setPayload(payload).send();
}

FlasckServices.CrosetService.prototype.move = function(crosetId, objId, fromKey, toKey) {
	"use strict";
	var self = this;
	var sendId = FlasckServices.CentralStore.realId(objId);
	if (!sendId) {
		// I think in this case we need to try and remember that we should do this and get a callback
		// when we have the real ID.  This gets more complex as time goes by, because you end up changing
		// the thing you inserted and everything, so you probably need to consolidate those changes
		// for now, just keep retrying until it is here :-)
		console.log("We don't have a real id for this yet; deferred case handling needed");
		setTimeout(function() { self.move(crosetId, objId, fromKey, toKey); }, 150);
		return;
	}
	var croset = this.store[crosetId];
	if (!croset)
		throw new Error("There is no croset for" + crosetId);
	ZinikiConn.req.invoke("croset/" + crosetId + "/move/" + sendId + "/" + fromKey +"/" + toKey).send();
}

FlasckServices.CrosetService.prototype.delete = function(crosetId, key, objId) {
	"use strict";
	var self = this;
	var sendId = FlasckServices.CentralStore.realId(objId);
	if (!sendId) {
		// I think in this case we need to try and remember that we should do this and get a callback
		// when we have the real ID.  This gets more complex as time goes by, because you end up changing
		// the thing you inserted and everything, so you probably need to consolidate those changes
		// for now, just keep retrying until it is here :-)
		console.log("We don't have a real id for this yet; deferred case handling needed");
		setTimeout(function() { self.delete(crosetId, key, objId); }, 150);
		return;
	}
	var croset = this.store[crosetId];
	if (!croset)
		throw new Error("There is no croset for" + crosetId);
	ZinikiConn.req.invoke("croset/" + crosetId + "/delete/" + key).send();
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
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
	};
	if (haveZiniki) {
		// we can either subscribe to a resource or to a specific object by ID
		// we need to distinguish between these cases
		// for now we are putting the burden on the person asking for the object
		ZinikiConn.req.subscribe(resource, zinchandler).send();
	} else {
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:['hello, world']});
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
	this.crokeys = FlasckServices.CentralStore.crokeys;
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
				if (main !== 'Crokeys')
					throw new Error("I was expecting crokeys ...");
				var l = msg.payload[k];
				if (k == 'Crokeys') {
					if (l[0].keyType !== 'crindex')
						throw new Error("don't handle natural keys yet");
					crokeys.id = l[0].id;
					crokeys.keys = l[0].keys;
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
		self.crokeys[crokeys.id] = crokeys;
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'keys', args:[crokeys]});
	}
	if (haveZiniki) {
		var req = ZinikiConn.req.subscribe(index, zinchandler);
		// options should really be a map and processed as such ...
		// req.setOption("type", "wikipedia");
		var idx;
		for (var k in options) {
			if (options.hasOwnProperty(k))
				req.setOption(key, options[k]);
		}
		req.send();
	} else {
		setTimeout(function() {
            if (index.substring(index.length-9) === "/myqueues") {
                    self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'entry', args: ["13", new com.helpfulsidekick.chaddy.Queue('Q3', 'This Week')]}); 
                    self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'entry', args: ["31", new com.helpfulsidekick.chaddy.Queue('Q1', 'Captured Items')]}); 
                    self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'entry', args: ["29", new com.helpfulsidekick.chaddy.Queue('Q2', 'TODO Today')]}); 
                    self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'entry', args: ["55", new com.helpfulsidekick.chaddy.Queue('Q5', 'Chaddy bugs')]}); 
                    self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'entry', args: ["47", new com.helpfulsidekick.chaddy.Queue('Q4', 'Flasck Issues')]});
            } else if (index.substring(index.length-3) === "/Q3") {
                    self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'entry', args: ["17", new com.helpfulsidekick.chaddy.Task('I31', 'This Week #1')]}); 
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