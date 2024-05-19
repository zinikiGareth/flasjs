import { FLContext } from '../../../main/javascript/runtime/flcxt.js';
import { expect } from 'chai';
import { Sample } from './sample.js';

describe('Basic Application Testing', () => {
	it('has a title', () => {
        var _cxt = new FLContext({logger: console});
        var div;
        var appl = new Sample(_cxt, div, '');
        expect(appl.title).to.equal('Sample');
	});

    it('stores baseuri', () => {
        var _cxt = new FLContext({logger: console});
        var div;
        var appl = new Sample(_cxt, div, 'https://somewhere/');
        expect(appl.baseUri()).to.equal('https://somewhere/');
    });
});
