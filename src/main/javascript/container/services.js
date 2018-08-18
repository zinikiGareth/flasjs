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

FlasckServices.WindowService = function(postbox) {
	this.postbox = postbox;
	return this;
}

FlasckServices.WindowService.prototype.process = function(message) {
	"use strict";
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

FlasckServices.WindowService.prototype.closePopup = function() {
	"use strict";
	var elt = document.getElementById("flasck_popover");
	if (elt)
		elt.close();
}

FlasckServices.WindowService.prototype.requestFullScreen = function() {
	"use strict";
	var body = doc.getElementsByTagName("html")[0];
	body.webkitRequestFullScreen();
}

FlasckServices.WindowService.prototype.leaveFullScreen = function() {
	"use strict";
	var body = doc.getElementsByTagName("html")[0];
	doc.webkitCancelFullScreen();
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

FlasckServices.CentralStore.keyValue.merge = function(it) {
	if (this[it.id] === null || this[it.id] === undefined) {
		this[it.id] = it;
		return;
	}
	var already = this[it.id];
	for (var p in it)
		if (it.hasOwnProperty(p))
			already[p] = it[p];
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

// TODO: remove all the duplication in all these methods
FlasckServices.KeyValueService.prototype.typed = function(type, id, handler) {
	"use strict";
	var self = this;
	if (self.store.hasOwnProperty(id)) {
		var obj = self.store[id];
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		return;
	}

	var resource = 'typedObject/' + type + '/' + id;

	if (self.store.hasOwnProperty(resource)) {
		var obj = self.store[resource];
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		return;
	}
	var zinchandler = function (msg) {
		if (msg.error)
			console.log("error:", msg.error);
		else {
			var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
			self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		}
	};

	ZinikiConn.req.subscribe(resource, zinchandler).send();
}

FlasckServices.KeyValueService.prototype.unprojected = function(id, handler) {
	"use strict";
	var self = this;
	var resource = 'unprojected/' + id;
	
	
	/* This code, while a good idea, has the inherent flaw that it assumes that a given object
	 * will always have the same type, which is certainly not true in the face of envelopes
	if (self.store.hasOwnProperty(id)) {
		var obj = self.store[id];
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		return;
	}
	*/

	// This test seems safe, but I'm not sure that we're putting things back here in terms of resources ...
	if (self.store.hasOwnProperty(resource)) {
		var obj = self.store[resource];
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		return;
	}
	var zinchandler = function (msg) {
		if (msg.error)
			console.log("error:", msg.error);
		else {
			var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
			self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		}
	};

	ZinikiConn.req.subscribe(resource, zinchandler).send();
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
		if (msg.error)
			console.log("error:", msg.error);
		else {
			var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
			self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		}
	};
	ZinikiConn.req.subscribe(resource, zinchandler).send();
}

FlasckServices.KeyValueService.prototype.save = function(obj) {
	"use strict";
	var self = this;
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
	"use strict";
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

// interactions with the server
FlasckServices.CrosetService.prototype.create = function(handler) {
	"use strict";
	var self = this;
	console.log("create called with", handler);
}

FlasckServices.CrosetService.prototype.load = function(id, loadHandler) {
	"use strict";
	var self = this;
	console.log("load called with", id, loadHandler);
	var cro = Croset.cro(this);
	self.postbox.deliver(loadHandler.chan, { from: self._myAddr, method: 'loaded', args: [FLEval.toWire(null, cro, false)] });
}

FlasckServices.CrosetService.prototype.get = function(crosetId, after, count, handler) {
	"use strict";
	var self = this;
	var zinchandler = function (msg) {
		console.log("croset received", msg, "from Ziniki");
		if (msg.action === 'replace' || msg.action === 'insert') {
			var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
			self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
		} else if (msg.action === 'remove') {
			var obj = FlasckServices.CentralStore.unpackPayload(self.store, msg.payload);
			self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'remove', args:[obj]});
		} else
			throw new Error("Cannot handle croset update action: " + msg.payload.action);
	};
	ZinikiConn.req.subscribe("croset/" + crosetId + "/get/" + after + "/" + count, zinchandler).send();
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
		throw new Error("There is no croset for " + crosetId);
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


FlasckServices.ContentService = function(postbox) {
	this.postbox = postbox;
//	this.store = FlasckServices.CentralStore.crokeys;
	return this;
}

FlasckServices.ContentService.prototype.process = function(message) {
	"use strict";
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

FlasckServices.ContentService.prototype.upload = function(to, file) {
	"use strict";
	var form = new FormData();
	form.append("file", file);
	var request = new XMLHttpRequest();
	request.open("POST", to);
	request.send(form);
	// TODO: handle error recovery & transmission issues
}

FlasckServices.ContentService.prototype.readHTML = function(cid, h) {
	"use strict";
	var self = this;
	
	var csStateChange = function(obj) {
  		if (this.readyState == 4) {
  			var type = this.getResponseHeader("content-type");
			console.log("well,", type, this.responseText);
			self.postbox.deliver(h.chan, {from: self._myAddr, method: 'load', args:[type, this.responseText]});
  		}
	}
	
	var contentLink = function(msg) {
		var link = msg.payload["String"][0].value;
		if (link) {
            console.log("link = " + link);

            var csXHRr = new XMLHttpRequest();
            csXHRr.onreadystatechange = csStateChange;
            csXHRr.open("GET", link, true);
            csXHRr.send();
  		}
	}

	ZinikiConn.req.subscribe("content/" + cid + "/get", contentLink).send();
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
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'update', args:[obj]});
	};
	ZinikiConn.req.subscribe(resource, zinchandler).send();
}

FlasckServices.PersonaService.prototype.save = function(obj) {
	"use strict";
	var cvobj = {};
	for (var x in obj) {
		if (obj.hasOwnProperty(x) && x[0] != '_' && !(obj[x] instanceof Array) && typeof obj[x] !== 'object')
			cvobj[x] = obj[x];
	}
	var payload = {};
	payload[obj._ctor] = [cvobj];
	console.log("saving payload", JSON.stringify(payload));
	ZinikiConn.req.invoke("updatePersona/" + obj._ctor + "/" + obj.id).setPayload(payload).send();
}

FlasckServices.CredentialsService = function(document, postbox) {
	this.doc = document;
	this.postbox = postbox;
	return this;
}

FlasckServices.CredentialsService.prototype.process = function(message) {
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
//	console.log("scan", index, type, options, handler);
	var self = this;
	var zinchandler = function(msg) {
	    console.log("scan received msg:", msg);
		if (msg.error) {
			console.log("error on scan", msg.error);
			throw new Error(msg.error);
		}
	    var payload = msg.payload;
	    if (!payload || !payload['Crokeys']) {
	    	console.log("returning because payload = ", payload, " is null or has no type", type);
	    	return;
	    }
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
					var ck = l[0];
					if (ck.keytype !== 'crindex' && ck.keytype !== 'natural')
						throw new Error("can't handle key type " + ck.keytype);
					crokeys.id = ck.id;
					crokeys.keytype = ck.keytype;
					crokeys.keys = ck.keys;
				} else { // sideload actual objects
					if (l instanceof Array) {
						for (var i=0;i<l.length;i++) {
							var it = l[i];
							it._ctor = k;
							self.store.merge(it)
						}
					}
				}
			}
		}
		self.crokeys[crokeys.id] = crokeys;
		self.postbox.deliver(handler.chan, {from: self._myAddr, method: 'keys', args:[crokeys]});
	}
	var req = ZinikiConn.req.subscribe(index, zinchandler);
	var idx;
	for (var k in options) {
		if (options.hasOwnProperty(k))
			req.setOption(k, options[k]);
	}
	req.send();
}

FlasckServices.YoyoService = function(postbox) {
	this.postbox = postbox;
}

FlasckServices.YoyoService.prototype.process = function(message) {
	"use strict";
	var meth = this[message.method];
	if (!meth)
		throw new Error("There is no method '" + message.method +"'");
	meth.apply(this, message.args);
}

FlasckServices.YoyoService.prototype.get = function(id, handler) {
	"use strict";
	var self = this;
	var zinchandler = function(msg) {
//		console.log("yoyo received", msg, "from Ziniki for", id);
		var rp = msg.payload['Card'][0];
		self.postbox.deliver(handler.chan, { from: self._myAddr, method: 'showCard', args: [{_ctor:'Card', explicit: rp.explicit, loadId: rp.loadId}] });
	}
	
	var req = ZinikiConn.req.invoke('invoke/org.ziniki.builtin.1/flasck/getYoyo', zinchandler);
	var payload = {}
	payload['org.ziniki.flasck.FlasckOpArgs'] = [{yoyo: id}]; 
	req.setPayload(payload);
	req.send();
}

FlasckServices.provideAll = function(document, postbox, services) {
	"use strict";
	Flasck.provideService(postbox, services, "org.flasck.Timer", new FlasckServices.TimerService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Window", new FlasckServices.WindowService(postbox));
	Flasck.provideService(postbox, services, "org.flasck.Render", new FlasckServices.RenderService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Credentials", new FlasckServices.CredentialsService(document, postbox));
	Flasck.provideService(postbox, services, "org.ziniki.KeyValue", new FlasckServices.KeyValueService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.CrosetService", new FlasckServices.CrosetService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.ContentService", new FlasckServices.ContentService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Persona", new FlasckServices.PersonaService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Query", new FlasckServices.QueryService(postbox));
	Flasck.provideService(postbox, services, "org.ziniki.Yoyo", new FlasckServices.YoyoService(postbox));
}