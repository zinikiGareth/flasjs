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

fib