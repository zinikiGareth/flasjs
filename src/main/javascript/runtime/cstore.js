
//--REQUIRE

const ContractStore = function(_cxt) {
}

ContractStore.prototype.record = function(_cxt, name, impl) {
    this[name] = impl;
}

ContractStore.prototype.contractFor = function(_cxt, name) {
    const ret = this[name];
    if (!ret)
        throw new Error("There is no contract for " + name);
    return ret;
}

//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = ContractStore;
} else {
	window.ContractStore = ContractStore;
}