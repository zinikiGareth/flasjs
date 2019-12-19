const FLContext = require('../../main/javascript/runtime/flcxt');
const FieldsContainer = require('../../main/javascript/runtime/fields');
const { expect } = require('chai');

describe('comparisons', () => {
	it('strings can be equal', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.compare('hello', 'hello')).to.be.true;
	});

	it('strings can be different', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.compare('hello', 'world')).to.be.false;
	});

	it('numbers can be equal', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.compare(2, 2)).to.be.true;
	});

	it('strings can be different', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.compare(5, 7)).to.be.false;
	});

	it('numbers are not strings', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.compare(5, 'hello')).to.be.false;
	});

	it('random objects are compared as they are', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.compare(new Error('foo'), new Error('foo'))).to.be.false;
	});

	it('random identical objects are compared by identity', () => {
        var _cxt = new FLContext(null);
        var c1 = new Error('foo');
		expect(_cxt.compare(c1, c1)).to.be.true;
	});

});
