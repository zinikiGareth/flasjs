import { UTRunner } from '../../main/javascript/unittest/runner.js';
import FLContext from '../../main/javascript/runtime/flcxt.js';
import { expect } from 'chai';

describe('runner', () => {
    var runner = new UTRunner(console);

	it('can create a new context', () => {
        var _cxt = runner.newContext();
        expect(_cxt).to.be.instanceOf(FLContext);
	});

    it('can compare two equal values', () => {
        var _cxt = runner.newContext();
        expect(runner.assertSameValue(_cxt, 10, 10));
	});

    it('compare throws on two different values', () => {
        var _cxt = runner.newContext();
        try {
            expect(runner.assertSameValue(_cxt, 10, 20));
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: NSV\n  expected: 10\n  actual:   20");
        }
    });
});
