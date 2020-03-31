const FLContext = require('../../main/javascript/runtime/flcxt');
const { expect } = require('chai');

var MyContract = function() {
}
MyContract.prototype.name = function() {
    return 'MyContract';
}

describe("Mock Contracts", () => {
    it("has an interface name", () => {
        var _cxt = new FLContext({logger: console});
        var mc = _cxt.mockContract(new MyContract());
        expect(_cxt.isA(mc, "MyContract")).to.be.true;
    });
});