var CardArea = function(pdiv, wrapper, card) {
	"use strict";
	this._parent = null;
	this._wrapper = wrapper;
	this._doc = pdiv.ownerDocument;
	this._mydiv = pdiv;
	this._card = card;
}

var uniqid = 1;

var Area = function(parent, tag, ns) {
	"use strict";
	if (parent) {
		this._parent = parent;
		this._wrapper = parent._wrapper;
		this._doc = parent._doc;
		this._indiv = parent._mydiv;
		if (tag) {
			if (ns)
				this._mydiv = this._doc.createElementNS(ns, tag);
			else
				this._mydiv = this._doc.createElement(tag);
			this._mydiv.setAttribute('id', this._wrapper.cardId+'_'+(uniqid++));
			this._mydiv._area = this;
			this._indiv.appendChild(this._mydiv);
		}
		this._card = parent._card;
	}
}

Area.prototype._clear = function() {
	this._mydiv.innerHTML = '';
}

Area.prototype._onAssign = function(obj, field, fn) {
	"use strict";
	this._wrapper.onUpdate("assign", obj, field, this, fn);
}

var DivArea = function(parent, tag, ns) {
	"use strict";
	Area.call(this, parent, tag || 'div', ns);
	this._interests = [];
}

DivArea.prototype = new Area();
DivArea.prototype.constructor = DivArea;

DivArea.prototype._interested = function(obj, fn) {
	this._interests.push({obj: obj, fn: fn});
	fn.call(obj);
}

DivArea.prototype._fireInterests = function() {
	for (var i=0;i<this._interests.length;i++) {
		var ii = this._interests[i];
		ii.fn.call(ii.obj);
	}
}

DivArea.prototype._makeDraggable = function() {
	this._mydiv.setAttribute('draggable', 'true');
	this._mydiv['ondragstart'] = function(event) {
		_Croset.listDrag(event);
	}
}

DivArea.prototype._dropSomethingHere = function(contentTypes) {
	function isAcceptable(e) {
        var files = e.dataTransfer.files;
        var acceptable = false;
        for (var i=0;i<files.length; i++) {
        	for (var j=0;j<contentTypes.length;j++)
	            if (files[i].type.match(contentTypes[j]))
    	        	return files[i];
        }
        return null;
	}
	this._mydiv.addEventListener('dragover', function(e) {
        e.stopPropagation();
		e.preventDefault();
        if (isAcceptable(e)) {
	        e.dataTransfer.dropEffect = 'copy';
	    }
	});
	var mydiv = this._mydiv;
    this._mydiv.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var file = isAcceptable(e);
        if (file) {
        	mydiv.innerHTML = '';
            var reader = new FileReader();
            reader.onload = function(e2) { // finished reading file data.
                var img = document.createElement('img');
                img.src = reader.result;
                mydiv.appendChild(img);
                if (mydiv["on_drop"])
                	mydiv['on_drop'](new org.flasck.DropEvent(file));
            }
            reader.readAsDataURL(file); // start reading the file data.
		}
	});
}

var ListArea = function(parent, tag) {
	"use strict";
	Area.call(this, parent, tag || 'ul');
}

ListArea.prototype = new Area();
ListArea.prototype.constructor = ListArea;

ListArea.prototype._assignToVar = function(croset) {
	"use strict";
	this._wrapper.removeOnUpdate("croset", this._croset, null, this);
	this._croset = croset;
	this._clear();
	if (croset && !(croset instanceof FLError)) {
   		if (croset._ctor !== 'Croset') throw new Error('ListArea logic only handles Crosets right now');
    	var off = 0;
    	for (var pos=0;pos<10;pos++) {
    		if (pos+off >= croset.length())
    			break;
    		var v = croset.index(pos+off);
    		var child = this._newChild();
    		child._crokey = v;
    		this._insertItem(child);
    		child._assignToVar(croset.memberOrId(v));
  		}
  		this._wrapper.onUpdate("croset", croset, null, this);
	}
}

ListArea.prototype._insertItem = function(child) {
  	"use strict";
	if (!child._crokey)
		throw new Error("Cannot handle null _crokey in " + child);
	for (var i=0;i<this._mydiv.children.length;i++) {
		var a = this._mydiv.children[i];
		if (child._crokey.compare(a._area._crokey) < 0) {
			this._mydiv.insertBefore(child._mydiv, a);
			return;
		}
	}
	// if we reached the end
	this._mydiv.appendChild(child._mydiv);
}

ListArea.prototype._deleteItem = function(key) {
  	"use strict";
	for (var i=0;i<this._mydiv.children.length;i++) {
		var a = this._mydiv.children[i];
		if (key.compare(a._area._crokey) == 0) {
			this._mydiv.removeChild(a);
			return;
		}
	}
}

ListArea.prototype._moveItem = function(from, to) {
  	"use strict";
  	// I believe the semantics of appendChild/insertBefore mean that this is in fact unnecessary ...
//  	console.log("moving from", from, "to", to);
  	var removeDiv, beforeDiv;
	for (var i=0;i<this._mydiv.children.length;i++) {
		var a = this._mydiv.children[i];
		if (from.compare(a._area._crokey) == 0) {
			removeDiv = a;
			if (beforeDiv) break;
		}
		if (!beforeDiv && to.compare(a._area._crokey) <= 0) {
			beforeDiv = a;
			if (removeDiv) break;
		}
	}
//	console.log("move", removeDiv, "before", beforeDiv);
	if (beforeDiv == removeDiv) return;
	if (beforeDiv)
		this._mydiv.insertBefore(removeDiv, beforeDiv)
	else
		this._mydiv.appendChild(removeDiv);
	removeDiv._area._crokey = to;
}

/*
ListArea.prototype._format = function() {
	for (var c=0;c<this._mydiv.children.length;c++) {
		this._mydiv.children[c]._area.formatItem();
	}
}
*/

ListArea.prototype._supportDragging = function() {
	var ul = this._mydiv;
	var wrapper = this._wrapper;
	this._mydiv['ondragover'] = function(event) {
		_Croset.listDragOver(event, ul);
	}
	this._mydiv['ondrop'] = function(event) {
		var msgs = _Croset.listDrop(event, ul);
		wrapper.messageEventLoop(msgs);
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
//	console.log("setting text to", text);
	var tmp = this._doc.createTextNode(text);
	this._mydiv.innerHTML = '';
	this._mydiv.appendChild(tmp);
}

TextArea.prototype._insertHTML = function(e) {
	"use strict";
	e = FLEval.full(e);
	if (e === null || e === undefined || e instanceof FLError)
		e = "";
	this._mydiv.innerHTML = e.toString();
}

TextArea.prototype._assignToText = function(e) {
	"use strict";
	e = FLEval.full(e);
	if (e === null || e === undefined || e instanceof FLError)
		e = "";
	this._setText(e.toString());
}

TextArea.prototype._edit = function(ev, rules, containingObj) {
	var self = this;
	var ct = "";
	if (this._mydiv.childNodes.length > 0)
		ct = this._mydiv.childNodes[0].wholeText;
	this._mydiv.innerHTML = '';
	var input = this._doc.createElement("input");
	input.setAttribute("type", "text");
	input.value = ct;
	input.select();
	input.onblur = function(ev) { self._save(ev, rules, null, containingObj); }
	input.onkeyup = function(ev) { if (ev.keyCode == 13) { input.blur(); ev.preventDefault(); } }
	input.onkeydown = function(ev) { if (ev.keyCode == 27) { self._save(ev, rules, ct, containingObj); ev.preventDefault(); } }
	this._mydiv.appendChild(input); 
	input.focus(); 
	this._mydiv.onclick = null;
}

TextArea.prototype._save = function(ev, rules, revertTo) {
	var self = this;
	var input = revertTo || this._mydiv.children[0].value;
	if (revertTo == null) {
		// TODO: may need to do final validity checking
		// if (!rules.validate(input)) { ... }
		rules.save.call(this, this._wrapper, input);
	}
	this._mydiv.innerHTML = '';
	var text = this._doc.createTextNode(input);
	this._mydiv.appendChild(text);
	this._mydiv.onclick = function(ev) { self._edit(ev, rules); }
}

TextArea.prototype._editable = function(rules) {
	var self = this;
//	console.log("registering field", elt.id, "as subject to editing");
//	this._mydiv.flasckEditMode = false; 
	this._mydiv.onclick = function(ev) { self._edit(ev, rules); }
}

var CardSlotArea = function(parent, cardOpts) {
	"use strict";
	Area.call(this, parent, 'div');
	if (parent && cardOpts)
		this._wrapper.showCard(this._mydiv, cardOpts);
}

CardSlotArea.prototype = new Area();
CardSlotArea.prototype.constructor = CardSlotArea;

CardSlotArea.prototype._updateToCard = function(card) {
	if (card) {
		var ex = card.explicit;
		if (typeof ex === 'string')
			ex = getPackagedItem(ex);
		if (ex) {
			var opts = { explicit: ex };
			if (card.loadId)
				opts['loadId'] = card.loadId;
			this._wrapper.showCard(this._mydiv, opts);
		} else {
			console.log("There is no card called", card.explicit);
			// we should clear out the card
		}
	}
	// otherwise we should clear out the card
}

var CasesArea = function(parent) {
	"use strict";
	Area.call(this, parent, 'div');
}

CasesArea.prototype = new Area();
CasesArea.prototype.constructor = CasesArea;

CasesArea.prototype._setTo = function(fn) {
	if (this._current == fn)
		return;
	this._current = fn;
	this._mydiv.innerHTML = '';
	var r = new Object();
	fn.call(r, this);
}

var D3Area = function(parent, cardOpts) {
	"use strict";
	Area.call(this, parent);
	if (parent) {
		this._data = FLEval.full(this._card._d3init_chart());
		this._onUpdate();
	}
}

D3Area.prototype = new Area();
D3Area.prototype.constructor = D3Area;

D3Area.prototype._onUpdate = function() {
	this._wrapper.updateD3(this._indiv, this._data);
}

