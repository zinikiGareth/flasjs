const FLContext = require('./flcxt');
const { SimpleBroker } = require('../../resources/ziwsh');
//--REQUIRE

const JSEnv = function(broker) {
	this.logger = console;
	this.contracts = {};
	this.structs = {};
	this.objects = {};
	if (broker != null)
		this.broker = broker;
	else
		this.broker = new SimpleBroker(this, this, this.contracts);
	this.nextDivId = 1;
	this.evid = 1;
}

JSEnv.prototype.clear = function() {
	document.body.innerHTML = '';
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