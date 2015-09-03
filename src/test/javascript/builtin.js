// Builtin stuff; so core we couldn't do without it

// Lists

// Define an empty list by setting "_ctor" to "nil"
_Nil = function() {
	"use strict"
	this._ctor = 'Nil';
	return this;
}

_Nil.prototype.toString = function() {
	"use strict"
	return 'Nil';
}

Nil = new _Nil();

// Define a cons node by providing (possible closures for) head and tail and setting "_ctor" to "cons"
_Cons = function(a, l) {
	"use strict"
	this._ctor = 'Cons';
	this.head = a;
	this.tail = l;
	return this;
}

_Cons.prototype.toString = function() {
	"use strict"
	return 'Cons';
}

Cons = function(a,b) { return new _Cons(a,b); }

map = function(f,l) {
	"use strict"
	var l = FLEval.head(l);
	if (l._ctor !== 'Cons')
		return Nil;
	return Cons(FLEval.closure(f, l.head), FLEval.closure(map, f, l.tail));
}

// List comprehension for integers starting at n (and going to infinity)
intsFrom = function(n) {
	"use strict"
	return FLEval.closure(Cons, n, FLEval.closure(intsFrom, FLEval.closure(FLEval.plus, n, 1)));
}

/*
List.prototype.toString = function() {
	var ret = "[";
	var sep = "";
	for (var x = this;x && x._ctor !== 'nil';x = x.tail) {
		ret += sep + (x.head?x.head.toString():"");
		sep = ",";
	}
	return ret +"]";
}
*/

function _Tuple(members) {
	"use strict"
	this._ctor = 'Tuple';
	this.length = members.length;
	this.members = [];
	for (var i=0;i<this.length;i++)
		this.members[i] = members[i];
	return this;
}

_Tuple.prototype.toString = function() {
	"use strict"
	var ret = "(";
	var sep = "";
	for (var i=0;i<this.length;i++) {
		ret += sep + this.members[i];
		sep = ",";
	}
	return ret + ")";
}

Tuple = function() { return new _Tuple(arguments); }

// Assoc Lists or Maps or Hash-equivalent

_NilMap = function() {
	"use strict"
	this._ctor = 'NilMap';
	return this;
}

_NilMap.prototype.assoc = function() {
	"use strict"
	return null;
}

_NilMap.prototype.toString = function() {
	"use strict"
	return 'NilMap';
}

NilMap = new _NilMap();

_Assoc = function(k,v,r) {
	"use strict"
	this._ctor = 'Assoc';
	this.key = k;
	this.value = v;
	this.rest = r;
	return this;
}

_Assoc.prototype.assoc = function(key) {
	"use strict"
	if (key === this.key)
		return this.value;
	else
		return this.rest.assoc(key);
}

_Assoc.prototype.toString = function() {
	"use strict"
	return 'Assoc';
}

Assoc = function(k,v,r) { return new _Assoc(k,v,r); }

// Cunning Crosets

/* This may seem like overkill - why not just use a list for the ordering?
 * The answer is that on the server, you can't be guaranteed that you are seeing "the entire list"
 * and operations such as "insert" into a list of a million rows can be expensive.
 * Moreover, server-side operations can run into "collisions" where multiple people do updates and it
 * is unclear which should win.  Truth to tell, this can happen client-side too.  So, a CROSET with
 * a dedicated CROKEY which can be resolved is a better bet.
 */

/* TODO: refactor out the CROKEY.  It should be an array of "bytes" generated to the same algorithm as
 * server side if possible.  This should generate a javascript array like [0xe3, 0x87, 0x40] where each
 * byte is 0-255
 */ 
var onlyKey = function() {
	return [100];
}

var firstKey = function(before) {
	if (before[0] == 0)
		throw new Error("We need to handle the very-very-very-beginning difficult case");
	return [before[0]/2];
}

var lastKey = function(after) {
	return [after[0]+10];
}

var midKey = function(after, before) {
	var me = [];
	for (var i=0;i<after.length;i++) {
		// TODO: I think we're missing out the case where "before" expires before after
		if (after[i]+1<before[i]) {
			me.push((after[i]+before[i])/2);
			return me;
		}
		me.push(after[i]);
	}
	// if we get to the end with them seeming identical ...
	// this may or may not be the right thing to do
	me.push(128);
	return me;
}

function _Croset(list) {
	"use strict"
	this._ctor = 'Croset';
	this._special = 'object';
	this.members = [];
	this.hash = {};
	this.mergeAppend(list);
}

_Croset.prototype.insert = function(k, obj) {
	"use strict"
	if (!obj.id)
		return;
	if (!this._hasId(obj.id))
		this._insert(k, obj.id);
	if (obj._ctor)
		this.hash[obj.id] = obj;
}

_Croset.prototype._append = function(id) {
	"use strict"
	if (this.members.length === 0) {
		// the initial case
		this.members.push({ key: [100], id: id });
	} else {
		// go 10 past the final list entry
		this.members.push({ key: [this.members[this.members.length-1].key[0]+10], id: id });
	}
}

// return 1 if k2 is AFTER k1, -1 if k2 is BEFORE k1 and 0 if they are the same key
_Croset.prototype._keycomp = function(k1, k2) {
	"use strict"
	for (var i=0;i<k1.length;i++) {
		if (k1[i] > k2[i]) return 1;
		if (k1[i] < k2[i]) return -1;
	}
	if (k1.length == k2.length) return 0; // they are the same key
	if (k1.length > k2.length) return 1; // k1 is a subkey of k2 and thus after it
	if (k1.length < k2.length) return -1; // k1 is a prefix of k2 and thus before it
	throw new Error("You should never get here");
}

_Croset.prototype._insert = function(k, id) {
	"use strict"
	var entry = { key: k, id: id };
	for (var i=0;i<this.members.length;i++) {
		var m = this.members[i];
		if (this._keycomp(m['key'], k) === 1) {
			this.members.splice(i, 0, entry);
			return;
		}
	}
	this.members.push(entry);
}

// The goal here is that after this operation, this[pos] === id
_Croset.prototype._insertAt = function(pos, id) {
	"use strict"
	if (pos < 0 || pos > this.members.length)
		throw new Error("Cannot insert into croset at position" + pos);
	var k;
	if (pos == 0) {
		if (this.members.length == 0)
			k = onlyKey();
		else
			k = firstKey(this.members[0].key);
	} else if (pos == this.members.length) {
		k = lastKey(this.members[this.members.length-1].key);
	} else
		k = midKey(this.members[pos-1], this.members[pos]);
	
	var entry = { key: k, id: id };
	this.members.splice(pos, 0, entry);
}

_Croset.prototype.get = function(k) {
	"use strict"
	for (var i=0;i<this.members.length;i++) {
		var m = this.members[i];
		if (m.key === k)
			return m;
		else if (m.key > k)
			break;
	}
	throw new Error("No element", k, "in", this);
}

_Croset.prototype.range = function(from, to) {
	"use strict"
	var ret = Nil;
	for (var k=to-1;k>=from;k--) {
		if (k<this.members.length) {
			var v = this.members[k].id;
			if (this.hash[v])
				ret = Cons(this.hash[v], ret);
		}
	}
	return ret;
}

_Croset.prototype.mergeAppend = function(l) {
	"use strict"
	var l = FLEval.full(FLEval.inflate(l));
	while (l._ctor === 'Cons') {
//		console.log("handle", l.head);
		if (l.head.id) {
			if (!this._hasId(l.head.id)) { // only append if it's not in the list
				this._append(l.head.id);
			}
			if (l.head._ctor)
				this.hash[l.head.id] = l.head;
		}
		l = l.tail;
	}
}

_Croset.prototype.put = function(obj) {
	"use strict"
	obj = FLEval.head(obj);
	if (!obj.id) {
		debugger;
		throw new Error(obj + " does not have field 'id'");
	}
	if (!obj._ctor) {
		debugger;
		throw new Error(obj + " does not have _ctor");
	}
	obj.id = FLEval.full(obj.id);
	if (!this._hasId(obj.id))
		this._append(obj.id);
	if (obj._ctor)
		this.hash[obj.id] = obj;
}

_Croset.prototype._hasId = function(id) {
	"use strict"
	for (var i=0;i<this.members.length;i++) {
		if (this.members[i].id === id)
			return true;
	}
	return false;
}

_Croset.prototype.findLocation = function(id) {
	"use strict"
	for (var i=0;i<this.members.length;i++) {
		if (this.members[i].id === id)
			return i;
	}
	return -1;
}

_Croset.prototype.moveBefore = function(toMove, placeBefore) {
	console.log(toMove + " has moved before " + placeBefore);
	var moverLoc = this.findLocation(toMove);
	this.members.splice(moverLoc, 1); // remove the item at moverLoc
	if (!placeBefore) { // moving to the end is the simplest case
		this._append(toMove);
		console.log("moved to end:", this);
		return []; // need update messages
	}
	// This location is the location AFTER removing the element we're going to move
	var beforeLoc = this.findLocation(placeBefore); 
	this._insertAt(beforeLoc, toMove);
	console.log("moved to", beforeLoc, ":", this);
	return []; // need update messages
}

// Native drag-n-drop support

var findContainer = function(ev, id) {
	var t = ev.target;
	while (t) {
		if (t.id === id && t.croset)
    		return t;
    	t = t.parentElement;
    }
    return null;
}

_Croset.listDrag = function(ev) {
    ev.dataTransfer.setData("application/json", JSON.stringify({id: ev.target.id, item: ev.target.item_id, y: ev.y}));
}

_Croset.listDragOver = function(ev, into) {
	var c = findContainer(ev, into);
	if (c)
   		ev.preventDefault();
}

_Croset.listDrop = function(ev, into) {
	var c = findContainer(ev, into);
	if (c) {
		console.log("container croset has id", c.croset);
	    ev.preventDefault();
	    var data = JSON.parse(ev.dataTransfer.getData("application/json"));
	    var elt = document.getElementById(data.id);
	    var moved = ev.y-data.y;
	    var newY = elt.offsetTop-c.offsetTop+moved;
	    var prev;
	    for (var idx=0;idx<c.children.length;idx++) {
	    	var child = c.children[idx];
	    	var chtop = child.offsetTop - c.offsetTop;
	    	if (newY < chtop) {
	    		if (child.id !== data.id && (prev == null || prev.id != data.id)) {
				    // console.log(data.item + " has moved before " + child.item_id);
	    			var msgs = c.croset.moveBefore(data.item, child.item_id);
	    			// and now we need a context to process these ...
	    			// c.insertBefore(elt, child);
	    		}
	    		// else not moved in fact
	    		return;
	    	}
	    	prev = child;
	    }
	    // if it's not above anything, put it at the end
	    // c.appendChild(elt);
//	    console.log(data.item + " has moved to the end");
		var msgs = c.croset.moveBefore(data.item, null);
		// and now we need a context to process these ...
	}
}

Croset = function(list) { "use strict"; return new _Croset(list); }

// Message passing

_Send = function(target, method, args) {
	"use strict"
//	console.log("creating Send object, this = " + this);
	if (!this)
		throw "must be called with new";
	this._ctor = 'Send';
	this.target = target;
	this.method = method;
	this.args = args;
	return this;
}

Send = function(t, m, a) { return new _Send(t, m, a); }

_Assign = function(target, field, value) {
	"use strict";
	this._ctor = 'Assign';
	this.target = target;
	this.field = field;
	this.value = value;
}

Assign = function(target, field, value) { return new _Assign(target, field, value); }

_CreateCard = function(card, value, options, services) {
	"use strict"
	this._ctor = 'CreateCard';
	this.card = card;
	this.value = value;
	this.options = options;
	this.services = services;
}

_CreateCard.prototype.toString = function() {
	"use strict"
	return "CreateCard[" + "]";
}

CreateCard = function(card, value, options, services) { return new _CreateCard(card, value, options, services); }

_D3Action = function(action, args) {
	"use strict"
	this._ctor = 'D3Action';
	this.action = action;
	this.args = args;
}

D3Action = function(action, args) { return new _D3Action(action, args); }