// A library for handling the DOM

function DOM() {
}

DOM._Element = function(tag, attrMap, contents, events) {
	this._ctor = 'DOM.Element';
	// TODO: check tag and attribute (names?) for validity
	this.tag = tag;
	this.attrMap = attrMap;
	this.contents = contents;
	this.events = events;
	return this;
}

DOM._Element.prototype.toElement = function (doc) {
	var ret = doc.createElement(this.tag);
	for (var attr = this.attrMap;attr && attr._ctor === 'Cons'; attr = attr.tail) {
		ret.setAttribute(attr.head.members[0], attr.head.members[1]);
	}
	for (var c = this.contents;c && c._ctor === 'Cons'; c = c.tail) {
		if (typeof(c.head) === 'string' || typeof(c.head) === 'number') {
			ret.appendChild(doc.createTextNode(c.head));
		} else if (c.head instanceof DOM.Element) {
			ret.appendChild(c.head.toElement(doc));
		}
	}
	return ret;
}

DOM._Element.prototype.toString = function() {
	return "Element " + this.tag + " " + this.attrMap.toString() + " " + this.contents.toString();
}

DOM.Element = function(t,a,c,e) { return new DOM._Element(t,a,c,e); }

DOM;