import { UTRunner } from '../../main/javascript/unittest/runner.js';
import { Debug, Send, Assign } from '../../main/javascript/runtime/messages.js'
import { IdempotentHandler } from '../../main/resources/ziwsh.js';
import { expect, assert } from 'chai';

var MyObj = function(_cxt) {
    this.state = _cxt.fields();
}

MyObj.eval = function(_cxt) {
    const ret = new MyObj(_cxt);
    ret.state.set("_type", "MyObj");
    ret.state.set('x', 2);
    return ret;
}

MyObj.msg = function(_cxt, val) {
    const v1 = Assign.eval(_cxt, this, 'x', val);
    return _cxt.array(v1);
}

MyObj.prototype._methods = function() {
    return {
        "msg": MyObj.msg
    };
}

var Contract = function(cx) {
    cx.registerContract('Contract', this);
}
Contract.prototype.name = function() {
  return 'Contract';
}
Contract.prototype._methods = function() {
    return ['msg'];
}
Contract.prototype.msg = function(_cxt, _0) {
}
Contract.prototype.msg.nfargs = function() { return 1; }

describe('dispatcher', () => {
    var runner

    beforeEach(() => {
        runner = new UTRunner(console);
    });

	it('can print a debug', () => {
        var logger = { text:'', logs:'', debugmsg : function(msg) { this.text += msg; }, log : function(msg) { this.logs += "LOG[" + msg + "]"; }};
        runner = new UTRunner(logger);
        var _cxt = runner.newContext();
        var debug = Debug.eval(_cxt, "hello, world");
        runner.invoke(_cxt, debug);
        expect(logger.text).to.equal('hello, world');
	});

    it('nothing happens on null', () => {
        var _cxt = runner.newContext();
        runner.invoke(_cxt, null);
	});

    it('nothing happens on empty array', () => {
        var _cxt = runner.newContext();
        runner.invoke(_cxt, []);
    });
    
    it('can Send a message to Assign a value', () => {
        var _cxt = runner.newContext();
        var v = MyObj.eval(_cxt);
        runner.invoke(_cxt, Send.eval(_cxt, v, 'msg', [22]));
        expect(v.state.get('x')).to.equal(22);
    });
    
    it('can directly call a method on a mock contract', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        mock.expect("msg", [22]);
        runner.invoke(_cxt, Send.eval(_cxt, mock, 'msg', [22]));
    });
    
    it('can Send a message to a mock contract', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        mock.expect("msg", [22]);
        var svc = _cxt.broker.require('Contract');
        runner.invoke(_cxt, Send.eval(_cxt, svc, 'msg', [22]));
    });
    
    it('can Send a message to a mock contract with a handler', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        mock.expect("msg", [22]);
        var svc = _cxt.broker.require('Contract');
        runner.invoke(_cxt, Send.eval(_cxt, svc, 'msg', [22], new IdempotentHandler()));
    });
    
    it('an expectation must be on a method that exists', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        try {
            mock.expect("fred", [22]);
            assert.fail();
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: EXP\n  Contract does not have a method fred");
        }
    });
    
    it('an expectation must have the right number of parameters', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        try {
            mock.expect("msg", []);
            assert.fail();
        } catch (ex) {
            expect(ex.toString()).to.equal("Error: EXP\n  Contract.msg expects 1 parameters, not 0");
        }
    });
    
    it('can Send twice if we up the expectation', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        mock.expect("msg", [22]).allow(2);
        var svc = _cxt.broker.require('Contract');
        runner.invoke(_cxt, Send.eval(_cxt, svc, 'msg', [22]));
        runner.invoke(_cxt, Send.eval(_cxt, svc, 'msg', [22]));
    });
    
    it('a mock explodes if it is not expecting a method', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        var svc = _cxt.broker.require('Contract');
        const eih = _cxt.explodingHandler();
        var send = Send.eval(_cxt, svc, 'msg', [22], eih);
        runner.invoke(_cxt, send);
        eih.assertSatisfied();
        expect(runner.errors.length).to.equal(1);
        expect(runner.errors[0].message).to.equal("EXP\n  There are no expectations on Contract for msg");
    });
    
    it('a mock explodes if it is not expecting a specific method invocation', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        mock.expect("msg", [86]);
        var svc = _cxt.broker.require('Contract');
        const eih = _cxt.explodingHandler();
        var send = Send.eval(_cxt, svc, 'msg', [22], eih);
        runner.invoke(_cxt, send);
        eih.assertSatisfied();
        expect(runner.errors.length).to.equal(1);
        expect(runner.errors[0].message).to.equal("EXP\n  Unexpected invocation: Contract.msg 22");
    });

    it('a mock explodes if it is expecting more arguments', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        mock.expect("msg", [22]);
        var svc = _cxt.broker.require('Contract');
        const eih = _cxt.explodingHandler();
        var send = Send.eval(_cxt, svc, 'msg', [], eih);
        runner.invoke(_cxt, send);
        eih.assertSatisfied();
        expect(runner.errors.length).to.equal(1);
        expect(runner.errors[0].message).to.equal("EXP\n  Unexpected invocation: Contract.msg ");
    });

    it('a mock explodes if it is expecting a different argument', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        mock.expect("msg", [22]);
        var svc = _cxt.broker.require('Contract');
        const eih = _cxt.explodingHandler();
        var send = Send.eval(_cxt, svc, 'msg', [81], eih);
        runner.invoke(_cxt, send);
        eih.assertSatisfied();
        expect(runner.errors.length).to.equal(1);
        expect(runner.errors[0].message).to.equal("EXP\n  Unexpected invocation: Contract.msg 81");
    });

    it('a mock explodes if it has already been called', () => {
        var _cxt = runner.newContext();
        var mock = _cxt.mockContract(new Contract(_cxt));
        mock.expect("msg", [22]);
        var svc = _cxt.broker.require('Contract');
        const eih = _cxt.explodingHandler();
        var send = Send.eval(_cxt, svc, 'msg', [22], eih);
        runner.invoke(_cxt, send);
        runner.invoke(_cxt, send);
        eih.assertSatisfied();
        expect(runner.errors.length).to.equal(1);
        expect(runner.errors[0].message).to.equal("EXP\n  Contract.msg 22 already invoked (allowed=1; actual=1)");
    });

    it('Assign can change a value', () => {
        var _cxt = runner.newContext();
        var v = MyObj.eval(_cxt);
        runner.invoke(_cxt, Assign.eval(_cxt, v, 'x', 12));
        expect(v.state.get('x')).to.equal(12);
    });
});
