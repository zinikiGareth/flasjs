const FLContext = require('../../main/javascript/runtime/flcxt');
const { Nil, Cons } = require('../../main/javascript/runtime/lists');
const { expect } = require('chai');

describe('lists', () => {
	it('Nil returns an empty list', () => {
		var cxt = new FLContext(null);
		var nil = Nil.eval(cxt);
		expect(nil).to.deep.equal([]);
	});

// not yet true
	it('Cons prepends to a list', () => {
		var cxt = new FLContext(null);
		var c = Cons.eval(cxt);
		expect(c).to.deep.equal(['NotImplemented']);
	});
});
