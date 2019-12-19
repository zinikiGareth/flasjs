const { Debug, Send, Assign } = require('../../main/javascript/runtime/messages');
const FLContext = require('../../main/javascript/runtime/flcxt');
const { expect } = require('chai');

describe('messages', () => {
	it.skip('strings can be equal', () => {
		var _cxt = new FLContext(null);
		expect(_cxt.compare('hello', 'hello')).to.be.true;
	});
});
