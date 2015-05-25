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