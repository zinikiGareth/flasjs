const FLError = require('../../main/javascript/runtime/error');
const { expect } = require('chai');

describe('error class', () => {
	it('can be thrown and caught', () => {
		try {
			throw FLError.eval(null, "ha");
		} catch (error) {
			expect(error.name).to.equal('FLError');
			expect(error.message).to.equal('ha');
		}
	});
	
	it('can be compared to a similar error', () => {
		expect(FLError.eval(null, 'ha')._compare(null, FLError.eval(null, 'ha'))).to.equal(true);
	});
	
	it('is different to an error with another message', () => {
		expect(FLError.eval(null, 'ha')._compare(null, FLError.eval(null, 'yo'))).to.equal(false);
	});
	
	it('is different to an error with a different type', () => {
		expect(FLError.eval(null, 'ha')._compare(null, new Error('yo'))).to.equal(false);
	});
});
