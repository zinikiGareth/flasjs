// Calculate the primes using the Sieve of Eratosothenes.
// Define the primes as all the numbers that escape the sieve starting at 2
// The first item in the "sieved list" is prime
// For each number identified as prime, remove all multiples from the remaining list

// primes = sieve [2..]
function primes () {
	return FLEval.closure(sieve, StdLib.List.intsFrom(2));
}

// sieve (p:l) = p:sieve (filter (notp p) l)
function sieve(pl) {
	if (pl instanceof FLError)
		return pl;
	pl = FLEval.head(pl);
	if (pl instanceof StdLib.List) {
		if (pl._ctor === 'cons')
			return FLEval.closure(
				StdLib.List.cons,
				pl.head,
				FLEval.closure(
					sieve,
					FLEval.closure(
						StdLib.filter,
						FLEval.curry(
							notp,
							2,
							pl.head),
						pl.tail
					)
				)
			);
		return FLEval.error("sieve: not a cons");
	}
	return FLEval.error("sieve: not a list");
}

//notp p n = n % p != 0
function notp(p, n) {
	p = FLEval.head(p);
	if (p instanceof FLError)
		return p;
	n = FLEval.head(n);
	if (n instanceof FLError)
		return n;
	if (FLEval.isInteger(p) && FLEval.isInteger(n)) {
		return FLEval.closure(
			FLEval.mathNE,
			FLEval.closure(
				FLEval.mathMod,
				n,
				p
			),
			0
		);
	}
	return FLEval.error("notp: case not handled");
}

primes