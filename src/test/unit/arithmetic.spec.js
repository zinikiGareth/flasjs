const FLContext = require('../../main/javascript/runtime/flcxt');
const { FLBuiltin } = require('../../main/javascript/runtime/builtin');
const { expect } = require('chai');

describe('FLBuiltin.plus', () => {
	it('can add two numbers', () => {
		var cxt = new FLContext(null);
		var clos = cxt.closure(FLBuiltin.plus, 2, 3);
		var val = cxt.head(clos);
		expect(val).to.equal(5);
	});
});

describe('FLBuiltin.mul', () => {
	it('can multiply two numbers', () => {
		var cxt = new FLContext(null);
		var clos = cxt.closure(FLBuiltin.mul, 2, 3);
		var val = cxt.head(clos);
		expect(val).to.equal(6);
	});
});
