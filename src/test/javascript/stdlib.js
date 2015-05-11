// The Standard Library, exported under the "function" StdLib

function StdLib() {
}

// Lists are built in with operators for things like "empty list", "cons" and comprehensions.
function List() {
}

// Define an empty list by setting "_ctor" to "nil"
List.nil = function() {
	var ret = new List();
	ret._ctor = 'nil';
	return ret;
}

// Define a cons node by providing (possible closures for) head and tail and setting "_ctor" to "cons"
List.cons = function(a, l) {
	var ret = new List();
	ret._ctor = 'cons';
	ret.head = a;
	ret.tail = l;
	return ret;
}

// List comprehension for integers starting at n (and going to infinity)
List.intsFrom = function(n) {
	return FLEval.closure(List.cons, n, FLEval.closure(List.intsFrom, FLEval.closure(FLEval.plus, n, 1)));
}

StdLib.List = List;

// Standard library "take" function, defined as something like:
// take 0 l = []
// take n [] = []
// take n (a:l) = a:(take (n-1) l)

StdLib.take = function(n, l) {
	n = FLEval.head(n);
	if (n instanceof FLError)
		return n;
	l = FLEval.head(l);
	if (l instanceof FLError)
		return l;
	if (FLEval.isInteger(n) && l instanceof List) {
		if (n === 0)
			return List.nil;
		if (l._ctor === 'nil')
			return List.nil;
		if (l._ctor === 'cons')
			return FLEval.closure(
				List.cons,
				l.head,
				FLEval.closure(
					StdLib.take,
					FLEval.closure(
						FLEval.minus,
						n,
						1
					),
					l.tail
				)
			);
	}
	return FLEval.error("take: case not handled");
}

// The standard library "filter" function, which can be imagined as:
// filter f [] = []
// filter f (a:l)
//   if (f a) => a:(filter f l)
//   else => filter f l

StdLib.filter = function(f, al) {
	al = FLEval.head(al);
	if (al instanceof FLError)
		return al;
	if (al instanceof List) {
		if (al.__ctor == 'nil')
			return List.nil;
		f = FLEval.head(f);
		if (f instanceof FLError)
			return f;
		if (typeof f === 'function') {
			var b = FLEval.head(f.apply(undefined, [al.head]));
			if (b) {
				return FLEval.closure(
					List.cons,
					al.head,
					FLEval.closure(
						StdLib.filter,
						f,
						al.tail
					)
				);
			} else {
				return FLEval.closure(
					StdLib.filter,
					f,
					al.tail
				);
			}
		}
	}
}