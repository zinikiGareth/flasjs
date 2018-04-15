// Cunning crosets, redux

_Croset = function(service, id, sortBy) {
	"use strict";
	this.service = service;
	this.id = null;
	this.cliId = 1;
	this.elements = [];
	this.putState = { start: [] };
	
	var self = this;
	if (id == null) {
		service.create(function(newId) {
			self.id = newId;
		});
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
		this.service.put(this.putState, function(reply) {
			self.applyPutUpdate(reply);
		});
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
	// TODO: make a server request IFF we have an ID for the collection
	// TODO: request ALL the client ids at once
	return {
		clientId: c,
		serverId: null,
		item: item
	};
}

_Croset.prototype.applyPutUpdate = function(reply) {
	"use strict";
	var cids = reply.cids;
	for (var ci=0;ci<cids.length;ci++) {
		var cid = cids[ci].c;
		var idx = this.putState.start.indexOf(cid);
		if (idx > -1) {
			for (var j=0;j<this.elements.length;j++)
				if (this.elements[j].clientId == cid) {
					this.elements[j].serverId = cids[ci].s; 
					break;
				}
			this.putState.start.splice(idx, 1);
		}
	}
}

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