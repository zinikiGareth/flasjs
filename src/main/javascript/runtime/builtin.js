FLBuiltin = function() {
}

FLBuiltin.plus = function(_cxt, a, b) {
	return a+b;
}

FLBuiltin.mul = function(_cxt, a, b) {
	return a*b;
}

if (typeof(module) !== 'undefined') {
	module.exports = FLBuiltin;
} else {
	window.FLBuiltin = FLBuiltin;
}