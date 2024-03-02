import FLContext from '../../main/javascript/runtime/flcxt.js';
import FLCurry from '../../main/javascript/runtime/curry.js';
import { expect } from 'chai';

function f(_cxt, a, b) {
    return _cxt.full(a)+_cxt.full(b);
}
// f.nfargs = () => 2;

function sub(_cxt, a, b) {
    return _cxt.full(a)-_cxt.full(b);
}
// sub.nfargs = () => 2;

function split(_cxt, f, v) {
    return _cxt.curry(2, f, v);
}
split.nfargs = () => 2;

describe("trivia", () => {
	it('has a tostring', () => {
        var cxt = new FLContext({logger: console});
		var clos = cxt.curry(2, f);
		expect(clos.toString()).to.equal("FLCurry[2]");
	});
});

describe('currying', () => {
	it('can apply the right number of arguments', () => {
        var _cxt = new FLContext({logger: console});
        var fa = _cxt.curry(2, f, 7);
        expect(fa instanceof FLCurry).to.be.true;
        var applyTo = _cxt.closure(fa, 5);
        expect(_cxt.full(applyTo)).to.equal(12);
	});

    it('can be overapplied and have the rest left over', () => {
        var _cxt = new FLContext({logger: console});
        var fa = _cxt.closure(split, f, 6);
        var fb = _cxt.closure(fa, 3);
        expect(_cxt.full(fb)).to.equal(9);
	});
});

describe('object currying', () => {
    // This doesn't really do anything with the object so it is a bit of a fraud ...
	it('can apply the right number of arguments', () => {
        var _cxt = new FLContext({logger: console});
        var fa = _cxt.ocurry(2, f, {}, 7);
        expect(fa instanceof FLCurry).to.be.true;
        var applyTo = _cxt.closure(fa, 5);
        expect(_cxt.full(applyTo)).to.equal(12);
	});
});

describe('extended currying', () => {
    it('can pass the second without the first', () => {
        var _cxt = new FLContext({logger: console});
        var sub5 = _cxt.xcurry(2, 0, sub, 2, 5);
        var calc = _cxt.closure(sub5, 8);
        expect(_cxt.full(calc)).to.equal(3);
    });
});
