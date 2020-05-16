const FLContext = require('../../main/javascript/runtime/flcxt');
const { True, False, FLBuiltin } = require('../../main/javascript/runtime/builtin');
const { expect } = require('chai');

describe('basic logic', () => {
	it('can evaluate true', () => {
        var _cxt = new FLContext({logger: console});
		expect(True.eval(_cxt)).to.be.true;
	});

    it('can evaluate false', () => {
        var _cxt = new FLContext({logger: console});
		expect(False.eval(_cxt)).to.be.false;
	});

	it('true isTruthy', () => {
        var _cxt = new FLContext({logger: console});
		expect(_cxt.isTruthy(True.eval(_cxt))).to.be.true;
	});

    it('false is not isTruthy', () => {
        var _cxt = new FLContext({logger: console});
		expect(_cxt.isTruthy(False.eval(_cxt))).to.be.false;
	});
});

const RandomClass = function() {
};

RandomClass.prototype._areYouA = function(ty) {
	return "SomeInterface" == ty;
}

describe('isA logic', () => {
	it('knows true is True', () => {
        var _cxt = new FLContext({logger: console});
		expect(_cxt.isA(true, 'True')).to.be.true;
	});

	it('knows false is False', () => {
        var _cxt = new FLContext({logger: console});
		expect(_cxt.isA(false, 'False')).to.be.true;
	});
	
	it('can handle interface names', () => {
        var _cxt = new FLContext({logger: console});
		expect(_cxt.isA(new RandomClass(), 'SomeInterface')).to.be.true;
	});
	
	it('returns false when in doubt', () => {
        var _cxt = new FLContext({logger: console});
		expect(_cxt.isA("fred", 'DOUBT')).to.be.false;
	});
});
