var CardArea = function(pdiv, wrapper, card) {
	"use strict";
	this._parent = null;
	this._wrapper = wrapper;
	this._doc = pdiv.ownerDocument;
	this._mydiv = pdiv;
	this._card = card;
}

var Area = function(parent, tag) {
	"use strict";
	if (parent) {
		this._parent = parent;
		this._wrapper = parent._wrapper;
		this._doc = parent._doc;
		this._indiv = parent._mydiv;
		this._mydiv = this._doc.createElement(tag);
		this._mydiv._area = this;
		this._indiv.appendChild(this._mydiv);
	}
}

Area.prototype._clear = function() {
	this._mydiv.innerHTML = '';
}

Area.prototype._onAssign = function(obj, field) {
	"use strict";
	this._wrapper.onUpdate("assign", obj, field, this);
}

var DivArea = function(parent, tag) {
	"use strict";
	Area.call(this, parent, tag || 'div');
}

DivArea.prototype = new Area();
DivArea.prototype.constructor = DivArea;

var ListArea = function(parent, tag) {
	"use strict";
	Area.call(this, parent, tag || 'ul');
}

ListArea.prototype = new Area();
ListArea.prototype.constructor = ListArea;

ListArea.prototype._assignTo = function(croset) {
	"use strict";
	this._wrapper.removeActions(this);
	this._croset = croset;
	this._clear();
	if (croset) {
   		if (croset._ctor !== 'Croset') throw new Error('ListArea logic only handles Crosets right now');
    	var off = 0;
    	for (var pos=0;pos<10;pos++) {
    		if (pos+off >= croset.length())
    			break;
    		var v = croset.index(pos+off);
    		var child = this._newChild();
    		this._insertItem(child /* at end */);
    		child._assignTo(v);
  		}
  		this._wrapper.onUpdate("croins", croset, null, this);
	}
	this._format();
}

ListArea.prototype._insertItem = function(child) {
  	"use strict";
	if (!child._crokey)
		throw new Error("Cannot handle null _crokey in " + child);
	for (var i=0;i<this._mydiv.children.length;i++) {
		var a = this._mydiv.children[i];
		if (_Croset.prototype._keycomp(child._crokey, a._area._crokey) < 0) {
			this._mydiv.insertBefore(child._mydiv, a);
			return;
		}
	}
	// if we reached the end
	this._mydiv.appendChild(child._mydiv);
}

ListArea.prototype._format = function() {
	for (var c=0;c<this._mydiv.children.length;c++) {
		this._mydiv.children[c]._area.formatItem();
	}
}
	
var TextArea = function(parent, tag) {
	"use strict";
	Area.call(this, parent, tag || 'span');
}

TextArea.prototype = new Area();
TextArea.prototype.constructor = TextArea;

TextArea.prototype._setText = function(text) {
	"use strict";
	console.log("setting text to", text);
	var tmp = doc.createTextNode(text);
	this._mydiv.innerHTML = '';
	this._mydiv.appendChild(tmp);
}

TextArea.prototype._assignTo = function(e) {
	"use strict";
	e = FLEval.full(e);
	if (e === null || e === undefined)
		e = "";
	this._setText(e.toString());
}

