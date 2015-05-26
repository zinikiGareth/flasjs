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

function _Tuple() {
	"use strict"
	this.length = arguments.length;
	this.members = [];
	for (var i=0;i<this.length;i++)
		this.members[i] = arguments[i];
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

// Message passing

_Send = function(target, method, args) {
	'use strict';
	console.log("creating Send object, this = " + this);
	if (!this)
		throw "must be called with new";
	this._ctor = 'Send';
	this.target = target;
	this.method = method;
	this.args = args;
	return this;
}

Send = function(t, m, a) { return new _Send(t, m, a); }

_Assign = function(lvar, expr) {
	"use strict";
	this._ctor = 'Assign';
	this.lvar = lvar;
	this.expr = expr;
}

Assign = function(lvar, expr) { return new _Assign(lvar, expr); }