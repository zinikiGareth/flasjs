const FLContext = require('../../main/javascript/runtime/flcxt');
const { True, False, FLBuiltin } = require('../../main/javascript/runtime/builtin');
const { expect } = require('chai');

describe('basic logic', () => {
	it('can evaluate true', () => {
		var _cxt = new FLContext(null);
		expect(True.eval(_cxt)).to.be.true;
	});

    it('can evaluate false', () => {
		var _cxt = new FLContext(null);
		expect(False.eval(_cxt)).to.be.false;
	});
});
