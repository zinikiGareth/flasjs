const CommonEnv = require('./env');
const { SimpleBroker } = require('../../resources/ziwsh');
//--REQUIRE

const JSEnv = function(broker) {
	if (broker == null)
		broker = new SimpleBroker(this, this, {});
	CommonEnv.call(this, console, broker);
	if (typeof(FlasckServices) !== 'undefined') {
		FlasckServices.configure(this);
	}
}

JSEnv.prototype = new CommonEnv();
JSEnv.prototype.constructor = JSEnv;

//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = JSEnv;
} else {
	window.JSEnv = JSEnv;
}