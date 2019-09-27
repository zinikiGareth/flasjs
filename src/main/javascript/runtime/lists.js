const Nil = function() {
}

Nil.eval = function(_cxt) {
	return [];
}

const Cons = function() {
}

Cons.eval = function(_cxt, hd, tl) {
	return ["NotImplemented"];
}

if (typeof(module) !== 'undefined') {
	module.exports = { Nil, Cons }
} else {
	window.Nil = Nil;
	window.Cons = Cons;
}