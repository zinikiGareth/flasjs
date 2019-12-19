const FLContext = require('../../main/javascript/runtime/flcxt');
const FLError = require('../../main/javascript/runtime/error');
const { expect } = require('chai');

describe('error class', () => {
	var _cxt = new FLContext(null);
	
	it('can be thrown and caught', () => {
		try {
			throw _cxt.error("ha");
		} catch (error) {
			expect(error.name).to.equal('FLError');
			expect(error.message).to.equal('ha');
		}
	});
	
	it('can be compared to a similar error', () => {
		expect(_cxt.compare(_cxt.error('ha'), FLError.eval(null, 'ha'))).to.be.true;
	});
	
	it('is different to an error with another message', () => {
		expect(_cxt.compare(_cxt.error('ha'), _cxt.error('yo'))).to.be.false;
	});
	
	it('is different to an error with a different type', () => {
		expect(_cxt.compare(_cxt.error('ha'), new Error('yo'))).to.be.false;
	});

	it('can also compare using direct comparison', () => {
		expect(_cxt.error('ha')._compare(_cxt, _cxt.error('yo'))).to.be.false;
	});

	it('can also successfully compare using direct comparison', () => {
		expect(_cxt.error('ha')._compare(_cxt, _cxt.error('ha'))).to.be.true;
	});	
});
