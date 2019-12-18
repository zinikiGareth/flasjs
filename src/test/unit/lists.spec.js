const FLContext = require('../../main/javascript/runtime/flcxt');
const { Nil, Cons } = require('../../main/javascript/runtime/lists');
const { FLBuiltin } = require('../../main/javascript/runtime/builtin');
const FLError = require('../../main/javascript/runtime/error');
const { expect } = require('chai');

describe('lists', () => {
	it('Nil returns an empty list', () => {
		var _cxt = new FLContext(null);
		var nil = Nil.eval(_cxt);
		expect(nil).to.deep.equal([]);
	});

// not yet true
	it.skip('Cons prepends to a list', () => {
		var _cxt = new FLContext(null);
		var c = Cons.eval(_cxt);
		expect(c).to.deep.equal(['NotImplemented']);
	});
});

describe('list length', () => {
	it('explodes on a string', () => {
		var _cxt = new FLContext(null);
		var len = _cxt.closure(FLBuiltin.arr_length, 'hello');
		expect(_cxt.full(len)).to.be.instanceOf(FLError);
	})
	it('Nil has a length of zero', () => {
		var _cxt = new FLContext(null);
		var nil = Nil.eval(_cxt);
		var len = _cxt.closure(FLBuiltin.arr_length, nil);
		expect(_cxt.full(len)).to.equal(0);
	})
})
