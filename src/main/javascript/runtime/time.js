import FLError from './error';
import { FLBuiltin } from './builtin';
import FLObject from "./object";
import { IdempotentHandler } from '../../resources/ziwsh';
import { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } from './messages';
import { Crobag } from './crobag';
import { dateFormat } from './date.format';

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

Calendar.prototype._parseIsoItem = function(cursor, nd, decimal) {
    if (typeof(nd) == 'undefined') {
        nd = 2;
    }
    if (cursor.pos >= cursor.str.length)
        return 0;
    while (cursor.str[cursor.pos] == ':' || cursor.str[cursor.pos] == '-')
        ;
    if (cursor.pos >= cursor.str.length)
        return 0;
    var ret = 0;
    for (var i=0;i<nd && cursor.pos < cursor.str.length;i++) {
        var c = cursor.str[cursor.pos++];
        if (c < '0' || c > '9')
            break;
        if (decimal) {
            ret = ret + (c-'0') * decimal;
            decimal /= 10;
        } else {
            ret = ret*10 + (c-'0');
        }
    }
    return ret;
}

Calendar.prototype.parseIsoDateTime = function(_cxt, n) {
    n = _cxt.full(n);
	if (n instanceof FLError)
		return n;
	else if (typeof(n) !== 'string')
        return new FLError("not a string");
    var cursor = { str: n, pos: 0 };
    var year = this._parseIsoItem(cursor, 4);
    var month = this._parseIsoItem(cursor);
    var day = this._parseIsoItem(cursor);
    var dt = new Date();
    dt.setUTCFullYear(year);
    dt.setUTCMonth(month-1);
    dt.setUTCDate(day);
    dt.setUTCHours(0);
    dt.setUTCMinutes(0);
    dt.setUTCSeconds(0);
    dt.setUTCMilliseconds(0);
    var days = Math.floor(dt.getTime() / 86400000);
    if (cursor.pos < cursor.str.length && cursor.str[cursor.pos] == 'T')
        cursor.pos++;
    var hour = this._parseIsoItem(cursor);
    var min = this._parseIsoItem(cursor);
    var sec = this._parseIsoItem(cursor);
    var secs = ((hour*60) + min)*60 + sec;
    if (cursor.pos < cursor.str.length && cursor.str[cursor.pos] == '.')
        cursor.pos++;
    var nanos = this._parseIsoItem(cursor, 9, 100000000);
    var tz = cursor.str.substr(cursor.pos);
    // TODO: adjust for TZ
	return new Instant(days, secs * 1000 * 1000 * 1000 + nanos);
}
Calendar.prototype.parseIsoDateTime.nfargs = function() { return 1; }

Calendar.prototype._methods = function() {
    return {
        "isoDateTime": Calendar.prototype.isoDateTime,
        "parseIsoDateTime": Calendar.prototype.parseIsoDateTime
    };
}

export { Interval, Instant, Calendar };