import { FLContext } from '../../main/javascript/runtime/flcxt.js';
import { FLError } from '../../main/javascript/runtime/error.js'
import { Debug, Send, Assign } from '../../main/javascript/runtime/messages.js'
import { FieldsContainer, SimpleBroker, IdempotentHandler } from '../../main/resources/ziwsh.js';
import { FLBuiltin } from '../../main/javascript/runtime/builtin.js';
import { expect } from 'chai';

import { Nil, Cons } from '../../main/javascript/runtime/lists.js';

describe('lists', () => {
	it('Nil returns an empty list', () => {
        var _cxt = new FLContext({logger: console});
		var nil = Nil.eval(_cxt);
		expect(nil).to.deep.equal([]);
	});

	it('cxt.array builds a list', () => {
        var _cxt = new FLContext({logger: console});
		var arr = _cxt.array(3, 4, 5);
		expect(arr.length).to.equal(3);
	});

	it('Cons prepends to a list', () => {
        var _cxt = new FLContext({logger: console});
		var nil = Nil.eval(_cxt);
		var c1 = Cons.eval(_cxt, 12, nil);
		expect(nil).to.deep.equal([]);
		expect(c1).to.deep.equal([12]);
	});
});

describe('list length', () => {
	it('explodes on a string', () => {
        var _cxt = new FLContext({logger: console});
		var len = _cxt.closure(FLBuiltin.arr_length, 'hello');
		expect(_cxt.full(len)).to.be.instanceOf(FLError);
	})
	it('Nil has a length of zero', () => {
        var _cxt = new FLContext({logger: console});
		var nil = Nil.eval(_cxt);
		var len = _cxt.closure(FLBuiltin.arr_length, nil);
		expect(_cxt.full(len)).to.equal(0);
	})
});

describe('list comparisons', () => {
	it('nil is equal', () => {
        var _cxt = new FLContext({logger: console});
		var nil1 = Nil.eval(_cxt);
		var nil2 = Nil.eval(_cxt);
		expect(_cxt.compare(nil1, nil2)).to.be.true;
	})

	it('two identical lists are equals', () => {
        var _cxt = new FLContext({logger: console});
		var list1 = [3, 4, 5];
		var list2 = [3, 4, 5];
		expect(_cxt.compare(list1, list2)).to.be.true;
	})

	it('nil is not equal to a non-empty list', () => {
        var _cxt = new FLContext({logger: console});
		var nil = Nil.eval(_cxt);
		var list = [3, 4, 5];
		expect(_cxt.compare(nil, list)).to.be.false;
	})

	it('different length lists are not equal', () => {
        var _cxt = new FLContext({logger: console});
		var list1 = [3, 4];
		var list2 = [3, 4, 5];
		expect(_cxt.compare(list1, list2)).to.be.false;
	})

	it('lists with different elements are not equal', () => {
        var _cxt = new FLContext({logger: console});
		var list1 = [3, 4, 7];
		var list2 = [3, 4, 5];
		expect(_cxt.compare(list1, list2)).to.be.false;
	})
});

describe('head and tail', () => {
	it('head of list is first element', () => {
        var _cxt = new FLContext({logger: console});
		var list = [3,4,5];
		expect(_cxt.field(list, 'head')).to.equal(3);
	});

	it('tail of list is everything but first element', () => {
        var _cxt = new FLContext({logger: console});
		var list = [3,4,5];
		expect(_cxt.field(list, 'tail')).to.deep.equal([4,5]);
	});

	it('tail of list is not destructive', () => {
        var _cxt = new FLContext({logger: console});
		var list = [3,4,5];
		expect(_cxt.field(list, 'tail')).to.deep.equal([4,5]);
		expect(list.length).to.equal(3);
	});

	it('head of nil is a bad idea', () => {
        var _cxt = new FLContext({logger: console});
		var list = [];
		expect(_cxt.field(list, 'head')).to.be.instanceOf(FLError);
	});

	it('tail of nil is a bad idea', () => {
        var _cxt = new FLContext({logger: console});
		var list = [];
		expect(_cxt.field(list, 'tail')).to.be.instanceOf(FLError);
	});

	it('foo of list does not exist', () => {
        var _cxt = new FLContext({logger: console});
		var list = [3,4,5];
		expect(_cxt.field(list, 'foo')).to.be.instanceOf(FLError);
	});
});