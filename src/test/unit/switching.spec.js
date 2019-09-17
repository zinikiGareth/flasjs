const FLContext = require('../../main/javascript/runtime/flcxt');
const { expect } = require('chai');

describe('switching on primitives', () => {
	it('numbers are recognized as Number', () => {
		var cxt = new FLContext(null);
		expect(cxt.isA(42, 'Number')).to.be.true;
	});

	it('numbers are not recognized as String', () => {
		var cxt = new FLContext(null);
		expect(cxt.isA(42, 'String')).to.be.false;
	});

	it('strings are recognized as String', () => {
		var cxt = new FLContext(null);
		expect(cxt.isA('hello', 'String')).to.be.true;
	});

	it('strings are not recognized as Number', () => {
		var cxt = new FLContext(null);
		expect(cxt.isA('hello', 'Number')).to.be.false;
	});

	it('an empty array is recognized as Nil', () => {
		var cxt = new FLContext(null);
		expect(cxt.isA([], 'Nil')).to.be.true;
	});

	it('a non-empty array is not recognized as Nil', () => {
		var cxt = new FLContext(null);
		expect(cxt.isA([42], 'Nil')).to.be.false;
	});

	it('a non-empty array is recognized as Cons', () => {
		var cxt = new FLContext(null);
		expect(cxt.isA([42], 'Cons')).to.be.true;
	});

	it('an empty array is not recognized as Cons', () => {
		var cxt = new FLContext(null);
		expect(cxt.isA([], 'Cons')).to.be.false;
	});
});
