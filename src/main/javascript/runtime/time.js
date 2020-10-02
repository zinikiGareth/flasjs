const FLError = require('./error');
const FLBuiltin = require('./builtin');
const FLObject = require("./object");
const { IdempotentHandler } = require('../../resources/ziwsh');
const { ResponseWithMessages } = require("./messages");
const { Crobag } = require('./crobag');
//--REQUIRE

const Interval = function(d, ns) {
    this.days = d;
    this.ns = ns;
}

Interval.prototype.asJs = function() {
    return this.days * 86400000 + (this.ns/1000/1000);
}

Interval.prototype._towire = function(wf) {
    wf.days = days;
    wf.ns = ns;
}

const Instant = function(d, ns) {
    this.days = d;
    this.ns = ns;
}

Instant.prototype.asJs = function() {
    return this.days * 86400000 + (this.ns/1000/1000);
}

Instant.prototype._towire = function(wf) {
    wf.days = days;
    wf.ns = ns;
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

FLBuiltin.milliseconds = function(_cxt, n) {
    n = _cxt.full(n);
	if (n instanceof FLError)
		return n;
	else if (typeof(n) !== 'number')
        return new FLError("not a number");
	return new Interval(Math.floor(n / 86400000), (n % 86400000) * 1000 * 1000 * 1000);
}
FLBuiltin.milliseconds.nfargs = function() { return 1; }

FLBuiltin.fromunixdate = function(_cxt, n) {
    n = _cxt.full(n);
	if (n instanceof FLError)
		return n;
	else if (typeof(n) !== 'number')
        return new FLError("not a number");
	return new Instant(Math.floor(n / 86400), (n % 86400) * 1000 * 1000 * 1000);
}
FLBuiltin.fromunixdate.nfargs = function() { return 1; }

FLBuiltin.unixdate = function(_cxt, i) {
    i = _cxt.full(i);
	if (i instanceof FLError)
		return i;
	else if (!(i instanceof Instant))
        return new FLError("not an instant");
    var ds = i.days;
    var secs = i.ns/1000/1000/1000;
    return ds * 86400 + secs;
}
FLBuiltin.unixdate.nfargs = function() { return 1; }

/* Calendar */
const Calendar = function(_cxt, _card) {
    FLObject.call(this, _cxt);
    this._card = _card;
    this.state = _cxt.fields();
}

Calendar._ctor_gregorian = function(_cxt, _card) {
    const ret = new Calendar(_cxt, _card);
    return new ResponseWithMessages(_cxt, ret, []);
}
Calendar._ctor_gregorian.nfargs = function() { return 1; }

Calendar.prototype.isoDateTime = function(_cxt, inst) {
    inst = _cxt.full(inst);
    if (inst instanceof FLError)
        return inst;
    else if (!(inst instanceof Instant))
        return new FLError("not an instant");
    return dateFormat(new Date(inst.asJs()), dateFormat.masks.isoUtcDateTime);
}
Calendar.prototype.isoDateTime.nfargs = function() { return 1; }

Calendar.prototype._methods = function() {
    return {
        "isoDateTime": Calendar.prototype.isoDateTime
    };
}


//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
	module.exports = { Interval, Instant, Calendar };
} else {
	window.Instant = Interval;
    window.Interval = Interval;
    window.Calendar = Calendar;
}