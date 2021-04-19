const FLError = require('./error');
const { Assign, ResponseWithMessages } = require('./messages');
//--REQUIRE

const Nil = function() {
}

Nil.eval = function(_cxt) {
	return [];
}

/* istanbul ignore next */
const Cons = function() {
}

// Because we "pretend" to have Cons and Nil but actually have arrays,
// we need to put "head" and "tail" on Array for when they are invoked.
// But we need them to be on Cons for when they are referenced.
Array.prototype._field_head = function(x) {
	return this[0];
}
Array.prototype._field_head.nfargs = function() { return 0; }
Cons.prototype._field_head = Array.prototype._field_head;

Array.prototype._field_tail = function() {
	return this.slice(1);
}
Array.prototype._field_tail.nfargs = function() { return 0; }
Cons.prototype._field_tail = Array.prototype._field_tail;

Cons.eval = function(_cxt, hd, tl) {
	var cp = _cxt.spine(tl);
	if (cp instanceof FLError)
		return cp;
	else if (!cp)
		return [hd];
	cp = cp.slice(0);
	cp.splice(0, 0, hd);
	return cp;
}

const AssignItem = function(list, n) {
	this.list = list;
	this.n = n;
}

AssignItem.prototype._field_head = function(_cxt) {
	return this.list[this.n];
}
AssignItem.prototype._field_head.nfargs = function() { return 0; }

AssignItem.prototype.set = function(obj) {
	this.list[this.n] = obj;
}

//--EXPORTS
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
	module.exports = { Nil, Cons, AssignItem }
} else {
	window.Nil = Nil;
	window.Cons = Cons;
}