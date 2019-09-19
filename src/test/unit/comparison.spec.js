const FLContext = require('../../main/javascript/runtime/flcxt');
const { expect } = require('chai');

describe('comparison', () => {
	it('simple values compare as equal', () => {
		var cxt = new FLContext(null);
		expect(cxt.compare(42, 42)).to.be.true;
	});
	
	// TODO: more complex values, such as arrays
	// TODO: structures should delegate to _compareTo, if it exists
	// TODO: ultimately, return false
});
