const FLContext = require('../../main/javascript/runtime/flcxt');
const { Nil, Cons } = require('../../main/javascript/runtime/lists');
const { FLBuiltin } = require('../../main/javascript/runtime/builtin');
const FLError = require('../../main/javascript/runtime/error');
const { expect } = require('chai');

describe('strings', () => {
	it('strlen has the length of a string', () => {
		var _cxt = new FLContext(null);
		var len = _cxt.closure(FLBuiltin.strlen, 'hello');
		expect(_cxt.full(len)).to.equal(5);
	});

	it('strlen cannot be applied to Nil', () => {
		var _cxt = new FLContext(null);
		var nil = Nil.eval(_cxt);
		var len = _cxt.closure(FLBuiltin.strlen, nil);
		expect(_cxt.full(len)).to.be.instanceOf(FLError);
	});

	it('concat can append two strings', () => {
		var _cxt = new FLContext(null);
		var str = _cxt.closure(FLBuiltin.concat, 'hello', 'world');
		expect(_cxt.full(str)).to.equal('helloworld');
	});

	it('concat can append an empty string', () => {
		var _cxt = new FLContext(null);
		var str = _cxt.closure(FLBuiltin.concat, '', 'world');
		expect(_cxt.full(str)).to.equal('world');
	});

	it('strings can be equal', () => {
		var _cxt = new FLContext(null);
		var str = _cxt.closure(FLBuiltin.isEqual, 'world', 'world');
		expect(_cxt.full(str)).to.be.true;
	});

	it('strings can be different', () => {
		var _cxt = new FLContext(null);
		var str = _cxt.closure(FLBuiltin.isEqual, 'hello', 'world');
		expect(_cxt.full(str)).to.be.false;
	});
});
