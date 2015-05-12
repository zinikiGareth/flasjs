// A library for handling the DOM

function DOM() {
}

DOM.Element = function() {
}

DOM.Element.element = function(tag, attrMap, contents) {
	var ret = new DOM.Element();
	ret._ctor = 'element';
	// TODO: check tag and attribute (names?) for validity
	ret.tag = tag;
	ret.attrMap = attrMap;
	ret.contents = contents;
	return ret;
}

DOM.Element.prototype.toElement = function (doc) {
	var ret = doc.createElement(this.tag);
	for (var attr = this.attrMap;attr && attr._ctor === 'cons'; attr = attr.tail) {
		ret.setAttribute(attr.head.members[0], attr.head.members[1]);
	}
	for (var c = this.contents;c && c._ctor === 'cons'; c = c.tail) {
		if (typeof(c.head) === 'string' || typeof(c.head) === 'number') {
			ret.appendChild(doc.createTextNode(c.head));
		} else if (c.head instanceof DOM.Element) {
			ret.appendChild(c.head.toElement(doc));
		}
	}
	return ret;
}

DOM.Element.prototype.toString = function() {
	return "Element " + this.tag + " " + this.attrMap.toString() + " " + this.contents.toString();
}

DOM;