const FLContext = require('../../main/javascript/runtime/flcxt');
const { SimpleBroker } = require('../../main/resources/ziwsh');
const { expect } = require('chai');

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
        var _cxt = new FLContext({logger: console}, new SimpleBroker());
        var mc = _cxt.mockContract(new MyContract());
        expect(_cxt.isA(mc, "MyContract")).to.be.true;
    });
});