const FLError = require('../../main/javascript/runtime/error');
const { expect } = require('chai');

describe('error class', () => {
	it('can be thrown and caught', () => {
		try {
			throw FLError(null, "ha");
		} catch (error) {
			expect(error.name).to.equal('FLError');
			expect(error.message).to.equal('ha');
		}
	});
	
	it('can be compared to a similar error', () => {
		expect(FLError(null, 'ha')._compareTo(FLError(null, 'ha'))).to.equal(true);
	});
	
	it('is different to an error with another message', () => {
		expect(FLError(null, 'ha')._compareTo(FLError(null, 'yo'))).to.equal(false);
	});
	
	it('is different to an error with a different type', () => {
		expect(FLError(null, 'ha')._compareTo(new Error('yo'))).to.equal(false);
	});
});
