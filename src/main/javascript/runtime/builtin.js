// Builtin stuff; so core we couldn't do without it

function FLError(s) {
	this.message = s;
	console.log("FLAS Error encountered:", s);
}

FLError.prototype.toString = function() {
	return "ERROR: " + this.message;
}

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

function _Crokey(from, id) {
	"use strict"
	if (typeof id !== 'string')
		throw new Error("id must be a string");
	this._ctor = 'Crokey';
	this.id = id;
	if (from instanceof Array) {
		// (assume) it's an array of numbers ...
		this.key = from;
	} else if (typeof from === 'string') {
		// it's a hex string
		this.key = [];
		for (var i=0;i<from.length;i+=2)
			this.key[i/2] = parseInt(from.substring(i, i+2), 16);
	} else if (typeof from === 'object' && from._ctor === 'Crokey') {
		// it's another Crokey
		this.key = from.key;
	} else
		throw new Error("Cannot create a Crokey like that");
}

_Crokey.prototype.firstKey = function(id) {
	"use strict"
	if (this.key[0] == 0)
		throw new Error("We need to handle the very-very-very-beginning difficult case");
	return new Crokey([Math.floor(this.key[0]/2)], id);
}

_Crokey.prototype.lastKey = function(id) {
	"use strict"
	var prev = this.key[0];
	if (prev > 0xf0) throw new Error("The almost-as-tricky near-the-end case");
	return new Crokey([prev+8], id);
}

_Crokey.prototype.before = function(before, id) {
	"use strict"
	var me = [];
	for (var i=0;i<this.key.length;i++) {
		// TODO: I think we're missing out the case where "before" expires before after
		if (this.key[i]+1<before.key[i]) {
			me.push(Math.floor((this.key[i]+before.key[i])/2));
			return new Crokey(me, id);
		}
		me.push(after[i]);
	}
	// if we get to the end with them seeming identical ...
	// this may or may not be the right thing to do
	me.push(0x80);
	return new Crokey(me, id);
}

// return 1 if other is AFTER this, -1 if other is BEFORE this and 0 if they are the same key
_Crokey.prototype.compare = function(other) {
	"use strict"
	if (other._ctor !== 'Crokey')
		throw new Error("Cannot compare crokey to non-Crokey");
	for (var i=0;i<this.key.length;i++) {
		if (this.key[i] > other.key[i]) return 1;
		if (this.key[i] < other.key[i]) return -1;
	}
	if (this.key.length == other.key.length) return 0; // they are the same key
	if (this.key.length > other.key.length) return 1; // this.key is a subkey of other.key and thus after it
	if (this.key.length < other.key.length) return -1; // this.key is a prefix of other.key and thus before it
	throw new Error("You should never get here");
}

_Crokey.prototype.toString = function() {
	var ret = "";
	for (var i=0;i<this.key.length;i++) {
		var hx = this.key[i].toString(16).toUpperCase();
		while (hx.length < 2)
			hx = "0" + hx;
		ret += hx;
	}
	return ret;
}

function Crokey(from, id) { return new _Crokey(from, id); }

Crokey.onlyKey = function(id) {
	"use strict"
	return new Crokey([0x10], id);
}

function _Crokeys(listKeys) {
	this._ctor = 'Crokeys';
	this.keys = listKeys;
}

function Crokeys(l) { return new _Crokeys(l); }

function _Croset(crokeys) {
	"use strict"
	crokeys = FLEval.full(crokeys);
	if (crokeys instanceof Array || crokeys._ctor === 'Cons' || crokeys._ctor === 'Nil')
		crokeys = Crokeys(crokeys);
	else if (crokeys._ctor !== 'Crokeys')
		throw new Error("Cannot create a croset with " + crokeys);
	this._ctor = 'Croset';
	this._special = 'object';
	this.members = [];
	this.hash = {};
	this.mergeAppend(crokeys);
}

_Croset.prototype.length = function() {
	return this.members.length;
}

_Croset.prototype.insert = function(k, obj) {
	"use strict"
	if (!obj.id)
		return;
	if (!this._hasId(obj.id))
		this._insert(new Crokey(k, obj.id));
	if (obj._ctor)
		this.hash[obj.id] = obj;
}

_Croset.prototype._append = function(id) {
	"use strict"
	var key;
	if (this.members.length === 0) {
		// the initial case
		key = Crokey.onlyKey(id);
	} else {
		// at end
		key = this.members[this.members.length-1].lastKey(id);
	}
	this.members.push(key);
	return key;
}

_Croset.prototype._insert = function(ck) {
	"use strict"
	for (var i=0;i<this.members.length;i++) {
		var m = this.members[i];
		if (m.compare(ck) === 1) {
			this.members.splice(i, 0, ck);
			return;
		}
	}
	this.members.push(ck);
}

// The goal here is that after this operation, this[pos] === id
_Croset.prototype._insertAt = function(pos, id) {
	"use strict"
	if (pos < 0 || pos > this.members.length)
		throw new Error("Cannot insert into croset at position" + pos);
	var k;
	if (pos == 0) {
		if (this.members.length == 0)
			k = Crokey.onlyKey(id);
		else
			k = this.members[0].firstKey(id);
	} else if (pos == this.members.length) {
		k = this.members[this.members.length-1].lastKey(id);
	} else
		k = this.members[pos-1].before(this.members[pos], id);
	
	this.members.splice(pos, 0, k);
	return k;
}

_Croset.prototype.get = function(k) {
	"use strict"
	for (var i=0;i<this.members.length;i++) {
		var m = this.members[i];
		if (m.compare(k) === 0)
			return this.hash[m.id];
		else if (m.compare(k) === 0)
			break;
	}
	throw new Error("No key " + k + " in" + this);
}

_Croset.prototype.getOrId = function(k) {
	"use strict"
	for (var i=0;i<this.members.length;i++) {
		var m = this.members[i];
		if (m.compare(k) === 0) {
			var x = this.hash[m.id];
			if (x) 
				return x;
			// otherwise return "just the id"
			return { _ctor: 'org.ziniki.ID', id: m.id };
		} else if (m.compare(k) === 0)
			break;
	}
	throw new Error("No key" + k + "in" + this);
}

_Croset.prototype.index = function(idx) {
	"use strict"
	if (idx >= 0 && idx < this.members.length)
		return this.members[idx];
	throw new Error("No index" + idx + "in" + this);
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

_Croset.prototype.mergeAppend = function(crokeys) {
	"use strict"
	crokeys = FLEval.full(crokeys);
	if (crokeys._ctor !== 'Crokeys')
		throw new Error("MergeAppend only accepts Crokeys objects");
	if (crokeys.keys._ctor === 'Nil')
		return;
	if (!crokeys.id)
		throw new Error("Incoming crokeys must have a Croset ID");
	if (!this.crosetId)
		this.crosetId = crokeys.id;
	else if (this.crosetId != crokeys.id)
		throw new Error("Cannot apply changes from a different croset");
	var l = crokeys.keys;
	if (!(l instanceof Array))
		throw new Error("keys should be an array");
	var msgs = [];
	for (var i=0;i<l.length;i++) {
//		console.log("handle", l.head);
		if (l[i]._ctor !== 'Crokey')
			throw new Error("Needs to be a Crokey");
		if (!this._hasId(l[i].id)) { // only insert if it's not in the list
			this._insert(l[i]);
			msgs.push(new CrosetInsert(this, l[i]));
		}
	}
	return msgs;
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
	var msgs;
	var key = this._hasId(obj.id);
	if (!key) {
		key = this._append(obj.id);
		msgs = [new CrosetInsert(this, key)];
	} else
		msgs = [new CrosetReplace(this, key)];
	if (obj._ctor)
		this.hash[obj.id] = obj;
	return msgs;
}

_Croset.prototype.delete = function(id) {
	"use strict"
	if (!id)
		return; // part of our "be nice to nulls" policy
	if (!this.hash[id])
		throw new Error("There isn't an entry", id);
	delete this.hash[id];
	var msgs = [];
	for (var i=0;i<this.members.length;) {
		if (this.members[i].id === id) {
			msgs.push(new CrosetRemove(this, this.members[i], true));
			this.members.splice(i, 1);
		} else
			i++;
	}
	return msgs;
}

_Croset.prototype.clear = function() {
	"use strict"
	var msgs = [];
	while (this.members.length>0) {
		var m = this.members[0];
		delete this.hash[m.id];
		msgs.push(new CrosetRemove(this, m, false));
		this.members.splice(0, 1);
	}
	delete this.crosetId;
	return msgs;
}

// Can't we just ask if it's in the hash?
_Croset.prototype._hasId = function(id) {
	"use strict"
	for (var i=0;i<this.members.length;i++) {
		if (this.members[i].id === id)
			return this.members[i];
	}
	return undefined;
}

_Croset.prototype.findLocation = function(id) {
	"use strict"
	if (typeof id === 'string') {
		for (var i=0;i<this.members.length;i++) {
			if (this.members[i].id === id)
				return i;
		}
		/* I think this was supposed to be a key comparison, but I don't think it would have worked ...
	} else if (id instanceof Array) {
		for (var i=0;i<this.members.length;i++) {
			if (this.members[i].key === id)
				return i;
		}
		*/
	} else if (id instanceof _Crokey) {
		for (var i=0;i<this.members.length;i++) {
			var cmp = this.members[i].compare(id);
			if (cmp === 0)
				return i;
			else if (cmp > 0)
				return -1;
		}
	} else
		throw new Error("What is this?" + id);
	return -1;
}

_Croset.prototype.moveBefore = function(toMove, placeBefore) {
//	console.log(toMove + " has moved before " + placeBefore);
	var moverLoc = this.findLocation(toMove);
	if (moverLoc === -1) throw new Error("Did not find " + toMove);
	var oldKey = this.members[moverLoc];
	var mover = this.members.splice(moverLoc, 1)[0]; // remove the item at moverLoc
	var newKey;
	if (!placeBefore) { // moving to the end is the simplest case
		newKey = this._append(mover.id);
//		console.log("moved to end:", this);
	} else {
		// This location is the location AFTER removing the element we're going to move
		var beforeLoc = this.findLocation(placeBefore);
		if (moverLoc === -1) throw new Error("Did not find " + placeBefore);
		newKey = this._insertAt(beforeLoc, mover.id);
//		console.log("moved to", beforeLoc, ":", this);
	}
	return [new CrosetMove(this, oldKey, newKey)];
}

// Native drag-n-drop support

var findContainer = function(ev, div) {
	var t = ev.target;
	while (t) {
		if (t === div && t._area._croset)
    		return t;
    	t = t.parentElement;
    }
    return null;
}

_Croset.listDrag = function(ev) {
    ev.dataTransfer.setData("application/json", JSON.stringify({id: ev.target.id, y: ev.y}));
}

_Croset.listDragOver = function(ev, into) {
	var c = findContainer(ev, into);
	if (c)
   		ev.preventDefault();
}

_Croset.listDrop = function(ev, into) {
	var c = findContainer(ev, into);
	if (c) {
//		console.log("container croset is", c._area._croset);
		var doc = into.ownerDocument;
	    ev.preventDefault();
	    var data = JSON.parse(ev.dataTransfer.getData("application/json"));
	    var elt = doc.getElementById(data.id);
	    var moved = ev.y-data.y;
	    var newY = elt.offsetTop-c.offsetTop+moved;
	    var prev;
	    for (var idx=0;idx<c.children.length;idx++) {
	    	var child = c.children[idx];
	    	var chtop = child.offsetTop - c.offsetTop;
	    	if (newY < chtop) {
	    		if (child.id !== data.id && (prev == null || prev.id != data.id)) {
	    			return c._area._croset.moveBefore(doc.getElementById(data.id)._area._crokey, child._area._crokey);
	    		}
	    		// else not moved in fact ... nothing to do
	    		return [];
	    	}
	    	prev = child;
	    }
		return c._area._croset.moveBefore(doc.getElementById(data.id)._area._crokey, null);
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

_CreateCard = function(options, services) {
	"use strict"
	this._ctor = 'CreateCard';
	this.options = options;
	this.services = services;
}

_CreateCard.prototype.toString = function() {
	"use strict"
	return "CreateCard[" + "]";
}

CreateCard = function(options, services) { return new _CreateCard(options, services); }

_D3Action = function(action, args) {
	"use strict"
	this._ctor = 'D3Action';
	this.action = action;
	this.args = args;
}

D3Action = function(action, args) { return new _D3Action(action, args); }

_CrosetInsert = function(target, key) {
	"use strict"
	if (key._ctor !== 'Crokey') throw new Error("Not a crokey");
	this._ctor = "CrosetInsert";
	this.target = target;
	this.key = key;
}
CrosetInsert = function(target, key) { return new _CrosetInsert(target, key); }

_CrosetReplace = function(target, key) {
	"use strict"
	if (key._ctor !== 'Crokey') throw new Error("Not a crokey");
	this._ctor = "CrosetReplace";
	this.target = target;
	this.key = key;
}
CrosetReplace = function(target, key) { return new _CrosetReplace(target, key); }

_CrosetRemove = function(target, key, forReal) {
	"use strict"
	if (key._ctor !== 'Crokey') throw new Error("Not a crokey");
	this._ctor = "CrosetRemove";
	this.target = target;
	this.key = key;
	this.forReal = forReal;
}
CrosetRemove = function(target, key, forReal) { return new _CrosetRemove(target, key, forReal); }

_CrosetMove = function(target, from, to) {
	"use strict"
	if (from._ctor !== 'Crokey') throw new Error("Not a crokey");
	if (to._ctor !== 'Crokey') throw new Error("Not a crokey");
	this._ctor = "CrosetMove";
	this.target = target;
	this.from = from;
	this.to = to;
}
CrosetMove = function(target, from, to) { return new _CrosetMove(target, from, to); }

