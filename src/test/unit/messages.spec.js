const { Debug, Send, Assign } = require('../../main/javascript/runtime/messages');
const FLContext = require('../../main/javascript/runtime/flcxt');
const FLMakeSend = require('../../main/javascript/runtime/makesend');
const { expect } = require('chai');

describe('debug', () => {
	it('has tostring', () => {
		var _cxt = new FLContext(null);
		var v1 = Debug.eval(_cxt, "hello, world");
		// expect(_cxt.compare('hello', 'hello')).to.be.true;
		expect(v1.toString()).to.equal("Debug[hello, world]");
	});

	it('is comparable to another Debug with the same message', () => {
		var _cxt = new FLContext(null);
		var v1 = Debug.eval(_cxt, "hello, world");
		var v2 = Debug.eval(_cxt, "hello, world");
		expect(_cxt.compare(v1, v2)).to.be.true;
	});

	it('is different to another Debug with a different message', () => {
		var _cxt = new FLContext(null);
		var v1 = Debug.eval(_cxt, "hello, world");
		var v2 = Debug.eval(_cxt, "goodbye");
		expect(_cxt.compare(v1, v2)).to.be.false;
	});

	it('is different to a string', () => {
		var _cxt = new FLContext(null);
		var v1 = Debug.eval(_cxt, "hello, world");
		expect(_cxt.compare(v1, 'hello, world')).to.be.false;
	});
});


describe('mksend', () => {
	it("has tostring", () => {
		var _cxt = new FLContext(null);
		expect(_cxt.mksend('hello', {}, 1).toString()).to.equal("MakeSend[1]");
	});

	it('a send can be created', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.mksend('hello', {}, 0)).to.be.instanceOf(Send);
	});

	it('a send can be curried', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.mksend('hello', {}, 1)).to.be.instanceOf(FLMakeSend);
	});

	it('a curried send can be applied', () => {
		var _cxt = new FLContext(null);
		var v1 = _cxt.mksend('hello', {}, 1);
		var v2 = _cxt.closure(v1, 'hello');
		expect(_cxt.full(v2)).to.be.instanceOf(Send);
	});

	it('a curried send can be partially applied', () => {
		var _cxt = new FLContext(null);
		var v1 = _cxt.mksend('hello', {}, 2);
		var v2 = _cxt.closure(v1, 'hello');
		expect(_cxt.full(v2)).to.be.instanceOf(FLMakeSend);
	});});
