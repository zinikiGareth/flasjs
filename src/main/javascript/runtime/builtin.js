// Builtin stuff; so core we couldn't do without it

function getPackagedItem(name) {
	"use strict";
	var scope = window;
	while (true) {
		var idx = name.indexOf(".");
		if (idx == -1)
			return scope[name];
		scope = scope[name.substring(0, idx)];
		name = name.substring(idx+1);
	}
}

function FLError(s) {
	this.message = s;
	console.log("FLAS Error encountered:", s);
	if (window.callJava)
		window.callJava.error(s);
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

_StackPush = function(h, t) {
	"use strict";
	this._ctor = 'StackPush';
	this.head = h;
	this.tail = t;
	return this;
}

_StackPush.prototype.length = function() {
	"use strict"
	if (this.tail instanceof _Nil)
		return 1;
	return 1 + this.tail.length();
}

_StackPush.prototype.toString = function() {
	"use strict"
	return 'Stack' + this.length();
}

StackPush = function(h,t) {"use strict"; return new _StackPush(h,t);}
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

_Debug = function(value) {
	"use strict";
	this._ctor = 'Debug';
	this.value = value;
}

Debug = function(value) { return new _Debug(value); }

_MessageWrapper = function(value, msgs) {
	"use strict";
	this._ctor = 'MessageWrapper';
	this.value = value;
	this.msgs = msgs;
}

MessageWrapper = function(value, msgs) { return new _MessageWrapper(value, msgs); }

_CrosetInsert = function(target, key) {
	"use strict"
	if (key._ctor !== 'Crokey' && key._ctor !== 'NaturalCrokey') throw new Error("Not a crokey");
	this._ctor = "CrosetInsert";
	this.target = target;
	this.key = key;
}
CrosetInsert = function(target, key) { return new _CrosetInsert(target, key); }

_CrosetReplace = function(target, key) {
	"use strict"
	if (key._ctor !== 'Crokey' && key._ctor !== 'NaturalCrokey') throw new Error("Not a crokey");
	this._ctor = "CrosetReplace";
	this.target = target;
	this.key = key;
}
CrosetReplace = function(target, key) { return new _CrosetReplace(target, key); }

_CrosetRemove = function(target, key, forReal) {
	"use strict"
	if (key._ctor !== 'Crokey' && key._ctor !== 'NaturalCrokey') throw new Error("Not a crokey");
	this._ctor = "CrosetRemove";
	this.target = target;
	this.key = key;
	this.forReal = forReal;
}
CrosetRemove = function(target, key, forReal) { return new _CrosetRemove(target, key, forReal); }

_CrosetMove = function(target, from, to) {
	"use strict"
	if (from._ctor !== 'Crokey' && from._ctor !== 'NaturalCrokey') throw new Error("Not a crokey");
	if (to._ctor !== 'Crokey' && to._ctor !== 'NaturalCrokey') throw new Error("Not a crokey");
	this._ctor = "CrosetMove";
	this.target = target;
	this.from = from;
	this.to = to;
}
CrosetMove = function(target, from, to) { return new _CrosetMove(target, from, to); }

_Card = function(explicit, loadId) {
	"use strict";
	this._ctor = 'Card';
	this.explicit = explicit;
	this.loadId = loadId;
}

Card = function(explicit, loadId) { return new _Card(explicit, loadId); }