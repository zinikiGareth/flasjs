const FLContext = require('../../main/javascript/runtime/flcxt');
const Runner = require('../../main/javascript/unittest/runner');
const { expect } = require('chai');

describe('runner', () => {
	it('can create a new context', () => {
        var _cxt = Runner.newContext();
        expect(_cxt).to.be.instanceOf(FLContext);
	});

    it('can compare two equal values', () => {
        var _cxt = Runner.newContext();
        expect(Runner.assertSameValue(_cxt, 10, 10));
	});

    it('compare throws on two different values', () => {
        var _cxt = Runner.newContext();
        try {
            expect(Runner.assertSameValue(_cxt, 10, 20));
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: NSV\n  expected: 10\n  actual:   20");
        }
    });
});