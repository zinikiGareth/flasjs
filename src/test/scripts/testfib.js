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
	a = FLEval.strict(a);
	b = FLEval.strict(b);
	if (typeof(a) === 'number' && typeof(b) === 'number')
		return a+b;
	else
		return FLEval.error("plus: case not handled");
}

FLEval.minus = function(a, b) {
	a = FLEval.strict(a);
	b = FLEval.strict(b);
	if (typeof(a) === 'number' && typeof(b) === 'number')
		return a-b;
	else
		return FLEval.error("plus: case not handled");
}

FLEval.error = function(s) {
	return new FLError(s);
}

function fib (n) {
	n = FLEval.head(n);
//	console.log("Calling fib(" + n + ")");
	if (FLEval.isInteger(n)) {
		if (n === 0)
			return 1;
		else if (n === 1)
			return 1;
		else
			return FLEval.closure(
				FLEval.plus,
				FLEval.closure(fib, FLEval.closure(FLEval.minus, n, 1)),
				FLEval.closure(fib, FLEval.closure(FLEval.minus, n, 2))
			);
	} else
		return FLEval.error("fib: case not handled");
}

for (var i=0;i<10;i++)
	console.log(FLEval.strict(fib(i)));