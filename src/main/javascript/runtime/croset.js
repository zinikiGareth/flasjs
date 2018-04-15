// Cunning crosets, redux

_Croset = function(service, id, sortBy) {
	"use strict";
	this.id = null;
	this.cliId = 1;
	this.elements = [];
	
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
	this.elements.splice(0, 0, this.makeElement(item));
}

_Croset.prototype.append = function(item) {
	"use strict";
	this.elements.splice(this.elements.length, 0, this.makeElement(item));
}

_Croset.prototype.makeElement = function(item) {
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