const FLError = require('./error');
//--REQUIRE

const Nil = function() {
}

Nil.eval = function(_cxt) {
	return [];
}

/* istanbul ignore next */
const Cons = function() {
}

Cons.eval = function(_cxt, hd, tl) {
	var cp = _cxt.spine(tl);
	if (cp instanceof FLError)
		return cp;
	cp = cp.slice(0);
	cp.splice(0, 0, hd);
	return cp;
}

//--EXPORTS
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
	module.exports = { Nil, Cons }
} else {
	window.Nil = Nil;
	window.Cons = Cons;
}