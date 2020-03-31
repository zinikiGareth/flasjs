const FLContext = require('../../main/javascript/runtime/flcxt');
const { FieldsContainer } = require('../../main/resources/ziwsh');
const { expect } = require('chai');

var MyObj = function(_cxt) {
    this.state = _cxt.fields();
}

MyObj.eval = function(_cxt) {
    const ret = new MyObj(_cxt);
    return ret;
}

describe('fields', () => {
	it('two empty objects compare equal', () => {
		var _cxt = new FLContext({ logger: console });
        var empty1 = _cxt.fields();
        var empty2 = _cxt.fields();
		expect(_cxt.compare(empty1, empty2)).to.be.true;
	});

	it('objects with different numbers of keys are different', () => {
		var _cxt = new FLContext({ logger: console });
        var empty = _cxt.fields();
        var store = _cxt.fields();
        store.set('x', 42);
		expect(_cxt.compare(empty, store)).to.be.false;
	});

	it('objects with the same values are identical', () => {
		var _cxt = new FLContext({ logger: console });
        var store1 = _cxt.fields();
        store1.set('x', 42);
        var store2 = _cxt.fields();
        store2.set('x', 42);
		expect(_cxt.compare(store1, store2)).to.be.true;
	});

	it('objects with different keys are different', () => {
		var _cxt = new FLContext({ logger: console });
        var store1 = _cxt.fields();
        store1.set('x', 42);
        var store2 = _cxt.fields();
        store2.set('y', 42);
		expect(_cxt.compare(store1, store2)).to.be.false;
    });

	it('objects with different values for the same key are different', () => {
		var _cxt = new FLContext({ logger: console });
        var store1 = _cxt.fields();
        store1.set('x', 42);
        var store2 = _cxt.fields();
        store2.set('x', 84);
		expect(_cxt.compare(store1, store2)).to.be.false;
    });
});

describe('container', () => {
	it('two containers are the same if they have no entries', () => {
		var _cxt = new FLContext({ logger: console });
		var empty1 = MyObj.eval(_cxt);
		var empty2 = MyObj.eval(_cxt);
		expect(_cxt.compare(empty1, empty2)).to.be.true;
    });
    
    it('can get an field from the state', () => {
		var _cxt = new FLContext({ logger: console });
        var obj = MyObj.eval(_cxt);
        obj.state.set('x', 22);
        expect(_cxt.field(obj, 'x')).to.equal(22);
    });
});