const FLError = require('./error');
const FLBuiltin = require('./builtin');
//--REQUIRE

const Interval = function(d, us) {
    this.days = d;
    this.us = us;
}

Interval.prototype._towire = function(wf) {
    wf.days = days;
    wf.us = us;
}

FLBuiltin.seconds = function(_cxt, n) {
    n = _cxt.full(n);
	if (n instanceof FLError)
		return n;
	else if (typeof(n) !== 'number')
        return new FLError("not a number");
	return new Interval(Math.floor(n / 86400), (n % 86400) * 1000 * 1000 * 1000);
}
FLBuiltin.seconds.nfargs = function() { return 1; }

//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
	module.exports = { Interval };
} else {
	window.Interval = Interval;
}