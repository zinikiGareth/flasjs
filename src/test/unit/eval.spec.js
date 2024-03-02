import FLContext from '../../main/javascript/runtime/flcxt.js';
import { expect } from 'chai';

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
        var _cxt = new FLContext({logger: console});
		var clos = _cxt.closure(a);
		expect(clos.toString()).to.equal("FLClosure[]");
	});
});

describe('head evaluation', () => {
	it('can expand a closure', () => {
        var _cxt = new FLContext({logger: console});
		var clos = _cxt.closure(a);
		var val = _cxt.head(clos);
		expect(val).to.equal(42);
	});

	it('can expand a closure with an argument', () => {
        var _cxt = new FLContext({logger: console});
		var clos = _cxt.closure(b, 6);
		var val = _cxt.head(clos);
		expect(val).to.equal(42);
	});
});

describe('full evaluation', () => {
	it('can expand a closure', () => {
        var _cxt = new FLContext({logger: console});
		var clos = _cxt.closure(a);
		var val = _cxt.full(clos);
		expect(val).to.equal(42);
	});

	it('can expand a closure with an argument', () => {
        var _cxt = new FLContext({logger: console});
		var clos = _cxt.closure(b, 6);
		var val = _cxt.full(clos);
		expect(val).to.equal(42);
	});

	it('can expand an array of closures', () => {
        var _cxt = new FLContext({logger: console});
		var arr = [_cxt.closure(a), _cxt.closure(b, 3)];
		var val = _cxt.full(arr);
		expect(val).to.deep.equal([42, 21]);
	});
});