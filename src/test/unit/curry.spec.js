const FLContext = require('../../main/javascript/runtime/flcxt');
const FLCurry = require('../../main/javascript/runtime/curry');
const { expect } = require('chai');

function f(_cxt, a, b) {
    return _cxt.full(a)+_cxt.full(b);
}
f.nfargs = () => 2;

function split(_cxt, f, v) {
    return _cxt.curry(2, f, v);
}
split.nfargs = () => 2;

describe("trivia", () => {
	it('has a tostring', () => {
		var cxt = new FLContext(null);
		var clos = cxt.curry(2, f);
		expect(clos.toString()).to.equal("FLCurry[2]");
	});
});

describe('currying', () => {
	it('can apply the right number of arguments', () => {
        var _cxt = new FLContext(null);
        var fa = _cxt.curry(2, f, 7);
        expect(fa instanceof FLCurry).to.be.true;
        var applyTo = _cxt.closure(fa, 5);
        expect(_cxt.full(applyTo)).to.equal(12);
	});

    it('can be overapplied and have the rest left over', () => {
        var _cxt = new FLContext(null);
        var fa = _cxt.closure(split, f, 6);
        var fb = _cxt.closure(fa, 3);
        expect(_cxt.full(fb)).to.equal(9);
	});
});

