FLBuiltin = function() {
}

FLBuiltin.plus = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a+b;
}

FLBuiltin.mul = function(_cxt, a, b) {
	a = _cxt.full(a);
	b = _cxt.full(b);
	return a*b;
}

if (typeof(module) !== 'undefined') {
	module.exports = FLBuiltin;
} else {
	window.FLBuiltin = FLBuiltin;
}