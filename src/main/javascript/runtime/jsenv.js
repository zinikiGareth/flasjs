const FLContext = require('./flcxt');
const { SimpleBroker } = require('../../resources/ziwsh');
//--REQUIRE

const JSEnv = function(broker) {
	this.logger = console;
	this.contracts = [];
	if (broker != null)
		this.broker = broker;
	else
		this.broker = new SimpleBroker(this, this, this.contracts);
}

JSEnv.prototype.newContext = function() {
	return new FLContext(this, this.broker);
}

//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = JSEnv;
} else {
	window.JSEnv = JSEnv;
}