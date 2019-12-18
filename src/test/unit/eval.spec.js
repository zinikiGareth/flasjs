const FLContext = require('../../main/javascript/runtime/flcxt');
const { expect } = require('chai');

var a = function(_cxt) {
	return 42;
};
a.nfargs = function() { return 0; }

var b = function(_cxt, x) {
	return x*7;
};
b.nfargs = function() { return 1; }

describe("trivia", () => {
	it('has a tostring', () => {
		var cxt = new FLContext(null);
		var clos = cxt.closure(a);
		expect(clos.toString()).to.equal("FLClosure[]");
	});
});

describe('head evaluation', () => {
	it('can expand a closure', () => {
		var cxt = new FLContext(null);
		var clos = cxt.closure(a);
		var val = cxt.head(clos);
		expect(val).to.equal(42);
	});

	it('can expand a closure with an argument', () => {
		var cxt = new FLContext(null);
		var clos = cxt.closure(b, 6);
		var val = cxt.head(clos);
		expect(val).to.equal(42);
	});
});

describe('full evaluation', () => {
	it('can expand a closure', () => {
		var cxt = new FLContext(null);
		var clos = cxt.closure(a);
		var val = cxt.full(clos);
		expect(val).to.equal(42);
	});

	it('can expand a closure with an argument', () => {
		var cxt = new FLContext(null);
		var clos = cxt.closure(b, 6);
		var val = cxt.full(clos);
		expect(val).to.equal(42);
	});
});