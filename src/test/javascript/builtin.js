// Builtin stuff; so core we couldn't do without it

// Lists

// Define an empty list by setting "_ctor" to "nil"
_Nil = function() {
	"use strict"
	this._ctor = 'Nil';
	return this;
}

_Nil.prototype.toString = function() {
	return 'Nil';
}

Nil = new _Nil();

// Define a cons node by providing (possible closures for) head and tail and setting "_ctor" to "cons"
_Cons = function(a, l) {
	this._ctor = 'Cons';
	this.head = a;
	this.tail = l;
	return this;
}

_Cons.prototype.toString = function() {
	return 'Cons';
}

Cons = function(a,b) { return new _Cons(a,b); }

// List comprehension for integers starting at n (and going to infinity)
intsFrom = function(n) {
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
	return null;
}

_NilMap.prototype.toString = function() {
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
	if (key === this.key)
		return this.value;
	else
		return this.rest.assoc(key);
}

_Assoc.prototype.toString = function() {
	return 'Assoc';
}

Assoc = function(k,v,r) { return new _Assoc(k,v,r); }

// Cunning Crosets

function _Croset(list) {
	this._ctor = 'Croset';
	this._special = 'object';
	this.members = [];
	while ((list = FLEval.head(list)) && list._ctor === 'Cons') {
		var h = list.head = FLEval.head(list.head);
		if (h._ctor === 'Tuple' || h.length == 2) {
			this.insert(h.members[0], h.members[1]);
		}
		list = list.tail;
	}
}

_Croset.prototype.insert = function(k, v) {
	var entry = { key: k, value: v };
	for (var i=0;i<this.members.length;i++) {
		var m = this.members[i];
		if (m['key'] > k) {
			this.members.splice(i, 0, entry);
			return;
		}
	}
	this.members.push(entry);
}

_Croset.prototype.get = function(k) {
	for (var i=0;i<this.members.length;i++) {
		var m = this.members[i];
		if (m.key === k)
			return m;
		else if (m.key > k)
			break;
	}
	throw new Error("No element", k, "in", this);
}

Croset = function(list) { return new _Croset(list); }

// Message passing

_Send = function(target, method, args) {
	'use strict';
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

_Assign = function(field, value) {
	"use strict";
	this._ctor = 'Assign';
	this.field = field;
	this.value = value;
}

Assign = function(field, value) { return new _Assign(field, value); }

// TODO: surely this needs "value" as well?  Even if null?  How do we represent null?  How do we type it?
_CreateCard = function(card, into, services) {
	this._ctor = 'CreateCard';
	this.card = card;
	this.into = into;
	this.services = services;
}

_CreateCard.prototype.toString = function() {
	return "CreateCard[" + "]";
}

CreateCard = function(card, into, services) { return new _CreateCard(card, into, services); }

_D3Action = function(action, args) {
	this._ctor = 'D3Action';
	this.action = action;
	this.args = args;
}

D3Action = function(action, args) { return new _D3Action(action, args); }