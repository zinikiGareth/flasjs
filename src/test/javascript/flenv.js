function FLError(s) {
	this.message = s;
}

function FLClosure(fn, args) {
	this.fn = fn;
	this.args = args;
}

function FLEval() {
}

FLEval.head = function(x) {
	while (x instanceof FLClosure) {
		x = x.fn.apply(undefined, x.args);
	}
	return x;
}

FLEval.closure = function() {
	var args = [];
	for (var i=1;i<arguments.length;i++)
		args[i-1] = arguments[i];
	return new FLClosure(arguments[0], args);
}

FLEval.isInteger = function(x) {
	return (typeof(x) === 'number' && Math.floor(x) === x);
}

FLEval.plus = function(a, b) {
	a = FLEval.head(a);
	b = FLEval.head(b);
	if (typeof(a) === 'number' && typeof(b) === 'number')
		return a+b;
	else
		return FLEval.error("plus: case not handled");
}

FLEval.minus = function(a, b) {
	a = FLEval.head(a);
	b = FLEval.head(b);
	if (typeof(a) === 'number' && typeof(b) === 'number')
		return a-b;
	else
		return FLEval.error("plus: case not handled");
}

FLEval.error = function(s) {
	return new FLError(s);
}

FLEval;