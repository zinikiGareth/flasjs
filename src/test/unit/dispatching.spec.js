const FLContext = require('../../main/javascript/runtime/flcxt');
const Runner = require('../../main/javascript/unittest/runner');
const { Debug, Send, Assign } = require('../../main/javascript/runtime/messages');
const { expect } = require('chai');

var MyObj = function(_cxt) {
    this.state = _cxt.fields();
}

MyObj.eval = function(_cxt) {
    const ret = new MyObj(_cxt);
    ret.state.set('x', 2);
    return ret;
}

MyObj.msg = function(_cxt, val) {
    const v1 = Assign.eval(_cxt, this, 'x', val);
    return _cxt.array(v1);
}

MyObj.prototype.methods = function() {
    return {
        "msg": MyObj.msg
    };
}

describe('dispatcher', () => {
	it('can print a debug', () => {
        var logger = { text:'', log : function(msg) { this.text += msg; }};
        var _cxt = Runner.newContext(logger);
        var debug = Debug.eval(_cxt, "hello, world");
        Runner.invoke(_cxt, debug);
        expect(logger.text).to.equal('hello, world');
	});

    it('nothing happens on null', () => {
        var _cxt = Runner.newContext();
        Runner.invoke(_cxt, null);
	});

    it('nothing happens on empty array', () => {
        var _cxt = Runner.newContext();
        Runner.invoke(_cxt, []);
    });
    
    it('can Send a message to Assign a value', () => {
        var _cxt = Runner.newContext();
        var v = MyObj.eval(_cxt);
        Runner.invoke(_cxt, Send.eval(_cxt, v, 'msg', [22]));
        expect(v.state.get('x')).to.equal(22);
    });
    
    it('Assign can change a value', () => {
        var _cxt = Runner.newContext();
        var v = MyObj.eval(_cxt);
        Runner.invoke(_cxt, Assign.eval(_cxt, v, 'x', 12));
        expect(v.state.get('x')).to.equal(12);
    });
});
