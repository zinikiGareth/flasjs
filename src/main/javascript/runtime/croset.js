// Cunning crosets, redux

// TODO: This should be a value object, and we should have fields for clientids, etc.
// TODO: it needs to be 100% wire-format compatible
_CrosetChanges = function(changes) {
  "use strict";
  this._ctor = 'CrosetChanges';
  // this._card = undefined;
  // this._special = undefined;
  // this._contract = undefined;
  this.changes = changes;
}

CrosetChanges = function(v0) {
  "use strict";
  return new _CrosetChanges(v0);
}

_CrosetHandler = function(croset) {
  "use strict";
  this._ctor = 'CrosetHandler';
  // this._card = undefined;
  this._special = 'handler';
  this._contract = 'CrosetHandlerContract';
  this._croset = croset;
}

_CrosetHandler.prototype.setId = function(id) {
  "use strict";
  id = FLEval.full(id);
  if (id instanceof FLError) {
    return id;
  }
  if (typeof id === 'string') {
  	// TODO: should we make this a deferred action processed later?
  	// That seems like overkill but would be consistent with our pineal model
  	this._croset.id = id;
  	return null;
  }
  return FLEval.error("CrosetHandler.setId: case not handled");
}

_CrosetHandler.prototype.applyChanges = function(changes) {
  "use strict";
  changes = FLEval.full(changes);
  if (changes instanceof FLError) {
    return changes;
  }
  if (FLEval.isA(changes, 'CrosetChanges')) {
    this._croset.applyPutUpdate(changes);
  	return null;
  }
  return FLEval.error("CrosetHandler.applyChanges: case not handled");
}

_CrosetHandler.prototype.loadCroset = function(set) {
  "use strict";
  // TODO: this needs to process an object in WIRE FORMAT, whatever that is
  // (or we need to determine that it will be auto-unpacked, in which case we need to handle that correctly)
  for (var i=0;i<set.length;i++) {
    this._croset.elements.push(this._croset.makeElement(set[i].id, set[i].key));
  }
}

CrosetHandler = function(croset) {
  "use strict";
  return new _CrosetHandler(croset);
}

_Croset = function(service, id, version, sortBy, after, windowSize) {
	"use strict";
	this._ctor = 'Croset';
	this._special = 'object';
	this.service = service;
	this.id = null;
	this.sortBy = sortBy;
	this.cliId = 1;
	this.elements = [];
	if (sortBy)
		this.putState = { natural: [] };
	else
		this.putState = { start: [], end: [] };
	this.handler = CrosetHandler(this);
}

_Croset.prototype._init = function() {
	var v0 = FLEval.closure(Cons, this.handler, Nil);
	var v1 = FLEval.closure(Send, this.service, 'create', v0);
  	return FLEval.closure(Cons, v1, Nil);
	
	/*
	var self = this;
	if (!id) {
		service.create(this.handler);
	} else {
	    service.get(id, version, after, windowSize, this.handler);
	}
	*/
}

_Croset.prototype.length = function() {
	"use strict";
	return this.elements.length;
}

/** Get the actual item at a given position */
_Croset.prototype.at = function(pos) {
	"use strict";
	return this.elements[pos].item;
}

/** Get the croset "key" at a position.  Here, we actually return the whole thing, since
  * the key is in two parts.
  */ 
_Croset.prototype.key = function(pos) {
	"use strict";
	return this.elements[pos];
}

/** Test if one item is before another.
  * Returns false if they are the same item or neither is in the set
  * Returns true if the left item is earlier or the right is not in the set
  * Returns false if the right item is earlier
  *
  * This implementation could probably be optimised, given that we allegedly
  * have in-order-comparable keys, but that depends on having the server
  * key come back, which we can't guarantee.
  *
  * This implementation would then be a fallback.
  */ 
_Croset.prototype.before = function(left, right) {
	if (left == right)
		return false; // they are equal
	for (var i=0;i<this.elements.length;i++) {
		if (left == this.elements[i])
			return true;
		else if (right == this.elements[i])
			return false;
	}
	return false; // neither is actually in the set
}

_Croset.prototype.get = function(key) {
	"use strict";
	for (var i=0;i<this.elements.length;i++)
		if (this.elements[i].serverId == key)
			return this.elements[i].item;
	return null;
}

_Croset.prototype.prepend = function(item) {
	"use strict";
	var elt = this.makeElement(item);
	if (this.sortBy) {
		this.insertNatural(elt);
		this.putState.natural.push(item.id);
	} else {
		this.elements.splice(0, 0, elt);
		this.putState.start.splice(0, 0, elt.clientId);
	}
	if (this.id) {
		var self = this;
		this.service.put(this.putState);
	}
}

_Croset.prototype.append = function(item) {
	"use strict";
	var elt = this.makeElement(item);
	if (this.sortBy) {
		this.insertNatural(elt);
		this.putState.natural.push(item.id);
	} else {
		this.elements.splice(this.elements.length, 0, elt);
		this.putState.end.splice(this.putState.end.length, 0, elt.clientId);
	}
	if (this.id) {
		var self = this;
		this.service.put(this.putState);
	}
}

_Croset.prototype.insertNatural = function(elt) {
	"use strict";
	var key = this.sortBy(elt.item);
	// TODO: should we sanity check this?
	// TODO: we need to consider the "mixed" case of natural+differentiator
	elt.clientId = elt.serverId = key;
	for (var i=0;i<this.elements.length;i++) {
		if (this.elements[i].clientId > key) {
			this.elements.splice(i, 0, elt);
			return;
		}
	}
	this.elements.push(elt);
}

_Croset.prototype.makeElement = function(item, serverId) {
	"use strict";
	// TODO: handle natural crokey more directly (don't need clientId)
	var c = this.cliId++;
	return {
		clientId: c,
		serverId: serverId,
		item: item
	};
}

_Croset.prototype.applyPutUpdate = function(changes) {
	"use strict";
	var msg = changes.changes;
	var cids = msg.cids;
	if (cids) {
		for (var ci=0;ci<cids.length;ci++) {
			var cid = cids[ci].c;
			var idx = this.putState.start.indexOf(cid);
			if (idx > -1) {
				this.putState.start.splice(idx, 1);
			} else {
				idx = this.putState.end.indexOf(cid);
				if (idx > -1) {
					this.putState.end.splice(idx, 1);
				}
			}
			if (idx > -1) { // via any channel
				for (var j=0;j<this.elements.length;j++)
					if (this.elements[j].clientId == cid) {
						this.elements[j].serverId = cids[ci].s;
						break;
					}
			}
		}
	}
	var inserts = msg.inserts;
	if (inserts) {
		var ii=0, ei=0;
		while (ii < inserts.length && ei < this.elements.length) {
			var io = inserts[ii];
			var eo = this.elements[ei];
			if (io.key < eo.serverId) {
				this.elements.splice(ei, 0, this.makeElement(io.id, io.key));
				ii++;
			}
			ei++;
		}
		while (ii < inserts.length) {
			var io = inserts[ii];
			this.elements.push(this.makeElement(io.id, io.key));
			ii++;
		}
	}
}

_Croset.prototype.toWire = function() {
	return {
		_ctor: 'Croset'
	};
}
// TODO: how do we pass the service in from FLAS code?
// TODO: does this all hang together?  Can I test that sooner?
// TODO: can I test it end-to-end in jasmine by creating a faux service (of a few dozen rows)?
Croset = function() { }
/** Read a wire transmission */
Croset._fromWire = function(env, obj) {
	debugger;
	// TODO: rationalize everything in every context so we have a single "environment" thing
	// with consistent objects and nomenclature
	// This only works on a card, and one that implements the CrosetService at that
	var service = env.card._contracts['org.ziniki.CrosetService'];
	return new _Croset(service, null, null, null);
}
/** create a brand new croset here, right now, and tell the service about it.
  * It will initially be empty, but the service will give it an ID
  */
Croset._ctor_create = function(service) {
 	"use strict";
	return new _Croset(service, null, null, null);
} 
/** This is out of date and should be replaced with _ctor_create above */
Croset.cro = function(service) {
 	"use strict";
	return new _Croset(service, null, null, null);
}
Croset.natural = function(service, sortBy) {
	"use strict";
	return new _Croset(service, null, null, sortBy);
}
/** Croset from says I want to read a croset from an existing ID */
Croset.from = function(service, id) {
	"use strict";
	// TODO: if (id is an IDwithVersion) set version here ...
	return new _Croset(service, id, null, null);
}
Croset.naturalFrom = function(service, id, sortBy) {
	"use strict";
	return new _Croset(service, id, null, sortBy);
}
Croset.select = function(service, id, after, windowSize) {
	"use strict";
	return new _Croset(service, id, null, null, after, windowSize);
}
Croset.naturalSelect = function(service, id, sortBy, after, windowSize) {
	"use strict";
	return new _Croset(service, id, null, sortBy, after, windowSize);
}
