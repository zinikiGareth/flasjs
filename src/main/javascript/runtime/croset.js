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

CrosetHandler = function(croset) {
  "use strict";
  return new _CrosetHandler(croset);
}

_Croset = function(service, id, sortBy) {
	"use strict";
	this.service = service;
	this.id = null;
	this.cliId = 1;
	this.elements = [];
	this.putState = { start: [] };
	this.handler = CrosetHandler(this);
	
	var self = this;
	if (id == null) {
		service.create(this.handler);
	}
}

_Croset.prototype.length = function() {
	"use strict";
	return this.elements.length;
}

_Croset.prototype.at = function(pos) {
	"use strict";
	return this.elements[pos].item;
}

_Croset.prototype.prepend = function(item) {
	"use strict";
	var elt = this.makeElement(item);
	this.elements.splice(0, 0, elt);
	this.putState.start.splice(0, 0, elt.clientId);
	if (this.id) {
		var self = this;
		this.service.put(this.putState);
	}
}

_Croset.prototype.append = function(item) {
	"use strict";
	this.elements.splice(this.elements.length, 0, this.makeElement(item));
}

_Croset.prototype.makeElement = function(item) {
	"use strict";
	// TODO: handle natural crokey more directly (don't need clientId)
	var c = this.cliId++;
	return {
		clientId: c,
		serverId: null,
		item: item
	};
}

_Croset.prototype.applyPutUpdate = function(changes) {
	"use strict";
	var reply = changes.changes;
	var cids = reply.cids;
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


// TODO: how do we pass the service in from FLAS code?
// TODO: does this all hang together?  Can I test that sooner?
// TODO: can I test it all client-side by creating a faux service (of a few dozen rows)?
Croset = function() { }
Croset.cro = function(service) {
 	"use strict";
	return new _Croset(service, null, null);
}
Croset.natural = function(service, sortBy) {
	"use strict";
	return new _Croset(service, null, sortBy);
}
Croset.from = function(service, id) {
	"use strict";
	return new _Croset(service, id, sortBy);
}
Croset.naturalFrom = function(service, id, sortBy) {
	"use strict";
	return new _Croset(service, id, sortBy);
}