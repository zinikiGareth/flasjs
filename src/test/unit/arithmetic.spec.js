const FLContext = require('../../main/javascript/runtime/flcxt');
const { FLBuiltin } = require('../../main/javascript/runtime/builtin');
const { expect } = require('chai');

describe('FLBuiltin.plus', () => {
	it('can add two numbers', () => {
        var cxt = new FLContext({logger: console});
		var clos = cxt.closure(FLBuiltin.plus, 2, 3);
		var val = cxt.head(clos);
		expect(val).to.equal(5);
	});
});

describe('FLBuiltin.minus', () => {
	it('can subtract two numbers', () => {
        var cxt = new FLContext({logger: console});
		var clos = cxt.closure(FLBuiltin.minus, 8, 3);
		var val = cxt.head(clos);
		expect(val).to.equal(5);
	});

	it('can subtract two reals ending up below zero', () => {
        var cxt = new FLContext({logger: console});
		var clos = cxt.closure(FLBuiltin.minus, 2.5, 4.25);
		var val = cxt.head(clos);
		expect(val).to.equal(-1.75);
	});
});

describe('FLBuiltin.mul', () => {
	it('can multiply two numbers', () => {
        var cxt = new FLContext({logger: console});
		var clos = cxt.closure(FLBuiltin.mul, 2, 3);
		var val = cxt.head(clos);
		expect(val).to.equal(6);
	});
});

describe('FLBuiltin.div', () => {
	it('can divide two integers', () => {
        var cxt = new FLContext({logger: console});
		var clos = cxt.closure(FLBuiltin.div, 6, 3);
		var val = cxt.head(clos);
		expect(val).to.equal(2);
	});

	it('can divide two integers leaving a real', () => {
        var cxt = new FLContext({logger: console});
		var clos = cxt.closure(FLBuiltin.div, 6, 4);
		var val = cxt.head(clos);
		expect(val).to.equal(1.5);
	});
});
