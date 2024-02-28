import FLObject from "./object";
import { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } from './messages';

// Use a seedable random number generator
// see http://prng.di.unimi.it/xoshiro128plusplus.c
function xoshiro128(a, b, c, d) {
    function rotl(x, k) {
        return ((x << k) | (x >> (32 - k)));
    }
    return function() {
        var result = (rotl(a + d, 7) + a);
        var t = (b << 9);
        c ^= a;
        d ^= b;
        b ^= c;
        a ^= d;
        c ^= t;
        d = rotl(d, 11);
        return result & 0x7fffffff;
    }
}

const Random = function(_cxt, _card) {
    FLObject.call(this, _cxt);
    this._card = _card;
    this.state = _cxt.fields();
    this.buffer = []; // needs to be cleared every time we "advance"
}

Random._ctor_seed = function(_cxt, _card, s) {
    const ret = new Random(_cxt, _card);
    var seed = s ^ 0xDEADBEEF;
    ret.generateNext = xoshiro128(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
    return new ResponseWithMessages(_cxt, ret, []);
}
Random._ctor_seed.nfargs = function() { return 2; }

Random._ctor_unseeded = function(_cxt, _card) {
    const ret = new Random(_cxt, _card);
    var seed = Math.random()*0xFFFFFFFF;
    ret.generateNext = xoshiro128(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
    return new ResponseWithMessages(_cxt, ret, []);
}
Random._ctor_unseeded.nfargs = function() { return 1; }

Random.prototype.next = function(_cxt, quant) {
    while (this.buffer.length < quant)
        this.buffer.push(this.generateNext());
    return this.buffer.slice(0, quant);
}
Random.prototype.next.nfargs = function() { return 1; }

Random.prototype.used = function(_cxt, quant) {
    return Send.eval(_cxt, this, "_used", [quant]);
}
Random.prototype.used.nfargs = function() { return 1; }

Random.prototype._used = function(_cxt, quant) {
    while (quant-- > 0 && this.buffer.length > 0)
        this.buffer.shift();
}
Random.prototype._used.nfargs = function() { return 1; }

Random.prototype._methods = function() {
    return {
        "used": Random.prototype.used,
        "_used": Random.prototype._used
    };
}

export { Random }