const FLContext = require('../../main/javascript/runtime/flcxt');
const { FieldsContainer } = require('../../main/javascript/runtime/fields');
const { FLBuiltin } = require('../../main/javascript/runtime/builtin');
const { expect } = require('chai');

const AcorClass = function() {
    this.state = new FieldsContainer();
}
AcorClass.eval = function() {
    const v1 = new AcorClass();
    v1.state.set('val', 'hello');
    v1.state.set('cnt', 13);
    return v1;
}
AcorClass.prototype.getVal = function(_cxt) {
    return this.state.get('val');
}
AcorClass.prototype.addMore = function(_cxt, addOn) {
    return this.state.get('cnt') + _cxt.full(addOn);
}
AcorClass.prototype.getVal.nfargs = function(_cxt) { return 0; }

describe('Acors', () => {
	it('can extract a field', () => {
        var _cxt = new FLContext(null);
        var v1 = AcorClass.eval(_cxt);
        var v2 = _cxt.mkacor(AcorClass.prototype.getVal, v1, 0);
        expect(_cxt.full(v2)).to.equal('hello');
	});

    it('can handle a curry field', () => {
        var _cxt = new FLContext(null);
        var v1 = AcorClass.eval(_cxt);
        var v2 = _cxt.mkacor(AcorClass.prototype.addMore, v1, 1);
        var v3 = _cxt.closure(v2, 7);
        expect(_cxt.full(v3)).to.equal(20);
	});
});