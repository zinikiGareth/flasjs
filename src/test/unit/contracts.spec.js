import { FLContext } from '../../main/javascript/runtime/flcxt.js';
import { SimpleBroker } from '../../main/resources/ziwsh.js';
import { expect } from 'chai';

var MyContract = function() {
}
MyContract.prototype.name = function() {
    return 'MyContract';
}
MyContract.prototype._methods = function() {
    return [];
}

describe("Mock Contracts", () => {
    it("has an interface name", () => {
        var _cxt = new FLContext({logger: console}, new SimpleBroker(console));
        var mc = _cxt.mockContract(new MyContract());
        expect(_cxt.isA(mc, "MyContract")).to.be.true;
    });
});