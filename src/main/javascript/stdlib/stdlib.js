// The Standard Library, exported under the "package" StdLib

function StdLib() {
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
		if (al.__ctor == 'Nil')
			return Nil;
		f = FLEval.head(f);
		if (f instanceof FLError)
			return f;
		if (typeof f === 'function') {
			var b = FLEval.head(f.apply(undefined, [al.head]));
			if (b) {
				return FLEval.closure(
					Cons,
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

// We still need to decide what to do about arrays and the like
// In general, we expect "list" but Crokeys in particular doesn't want to play that game
map = function(f,l) {
	"use strict"
	var l = FLEval.head(l);
	if (l instanceof Array)
		return StdLib._mapArray(f, l);
	if (l._ctor !== 'Cons')
		return Nil;
	return Cons(FLEval.closure(f, l.head), FLEval.closure(map, f, l.tail));
}

StdLib._mapArray = function(f, arr) {
	"use strict";
	var ret = Nil;
	for (var i=arr.length-1;i>=0;i--)
		ret = Cons(FLEval.closure(f, arr[i]), ret);
	return ret;
}

// List comprehension for integers starting at n (and going to infinity)
intsFrom = function(n) {
	"use strict"
	return FLEval.closure(Cons, n, FLEval.closure(intsFrom, FLEval.closure(FLEval.plus, n, 1)));
}

