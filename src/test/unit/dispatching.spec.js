const FLContext = require('../../main/javascript/runtime/flcxt');
const Runner = require('../../main/javascript/unittest/runner');
const { Debug, Send, Assign } = require('../../main/javascript/runtime/messages');
const { expect, assert } = require('chai');

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

Contract = function() {
}
Contract.prototype.name = function() {
  return 'Contract';
}
// Contract.prototype.name.nfargs = function() { return -1; }

// Contract.Down = function() {
// }
// Contract.Down.prototype.name = function() {
//   return 'Contract.Down';
// }
// Contract.Down.prototype.name.nfargs = function() { return -1; }

// Contract.Up = function() {
// }
// Contract.Up.prototype.name = function() {
//   return 'Contract.Up';
// }
// Contract.Up.prototype.name.nfargs = function() { return -1; }

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
    
    it('can Send a message to a mock contract', () => {
        var _cxt = Runner.newContext();
        var mock = _cxt.mockContract(new Contract());
        mock.expect("msg", [22]);
        Runner.invoke(_cxt, Send.eval(_cxt, mock, 'msg', [22]));
    });
    
    it('can Send twice if we up the expectation', () => {
        var _cxt = Runner.newContext();
        var mock = _cxt.mockContract(new Contract());
        mock.expect("msg", [22]).allow(2);
        Runner.invoke(_cxt, Send.eval(_cxt, mock, 'msg', [22]));
        Runner.invoke(_cxt, Send.eval(_cxt, mock, 'msg', [22]));
    });
    
    it('a mock explodes if it is not expecting a method', () => {
        var _cxt = Runner.newContext();
        var mock = _cxt.mockContract(new Contract());
        var send = Send.eval(_cxt, mock, 'msg', [22]);
        try {
            Runner.invoke(_cxt, send);
            /* istanbul ignore next */
            assert.fail("no error thrown");
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: There are no expectations on Contract for msg");
        }
    });
    
    it('a mock explodes if it is not expecting a specific method invocation', () => {
        var _cxt = Runner.newContext();
        var mock = _cxt.mockContract(new Contract());
        mock.expect("msg", []);
        var send = Send.eval(_cxt, mock, 'msg', [22]);
        try {
            Runner.invoke(_cxt, send);
            /* istanbul ignore next */
            assert.fail("no error thrown");
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: Unexpected invocation: Contract.msg 22");
        }
    });

    it('a mock explodes if it is expecting more arguments', () => {
        var _cxt = Runner.newContext();
        var mock = _cxt.mockContract(new Contract());
        mock.expect("msg", [22, 81, 'hello']);
        var send = Send.eval(_cxt, mock, 'msg', [22, 81]);
        try {
            Runner.invoke(_cxt, send);
            /* istanbul ignore next */
            assert.fail("no error thrown");
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: Unexpected invocation: Contract.msg 22,81");
        }
    });

    it('a mock explodes if it is expecting a different argument', () => {
        var _cxt = Runner.newContext();
        var mock = _cxt.mockContract(new Contract());
        mock.expect("msg", [22]);
        var send = Send.eval(_cxt, mock, 'msg', [81]);
        try {
            Runner.invoke(_cxt, send);
            /* istanbul ignore next */
            assert.fail("no error thrown");
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: Unexpected invocation: Contract.msg 81");
        }
    });

    it('a mock explodes if it has already been called', () => {
        var _cxt = Runner.newContext();
        var mock = _cxt.mockContract(new Contract());
        mock.expect("msg", [22]);
        var send = Send.eval(_cxt, mock, 'msg', [22]);
        Runner.invoke(_cxt, send);
        try {
            Runner.invoke(_cxt, send);
            /* istanbul ignore next */
            assert.fail("no error thrown");
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: Contract.msg 22 already invoked (allowed=1; actual=2)");
        }
    });

    it('Assign can change a value', () => {
        var _cxt = Runner.newContext();
        var v = MyObj.eval(_cxt);
        Runner.invoke(_cxt, Assign.eval(_cxt, v, 'x', 12));
        expect(v.state.get('x')).to.equal(12);
    });
});
