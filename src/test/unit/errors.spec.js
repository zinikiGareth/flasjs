const FLError = require('../../main/javascript/runtime/error');
const { expect } = require('chai');

describe('error class', () => {
	it('can be thrown and caught', () => {
		try {
			throw new FLError("ha");
		} catch (error) {
			expect(error.name).to.equal('FLError');
			expect(error.message).to.equal('ha');
		}
	});
});
