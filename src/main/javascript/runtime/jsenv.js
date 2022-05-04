const { CommonEnv } = require('./env');
const { SimpleBroker } = require('../../resources/ziwsh');
//--REQUIRE

const JSEnv = function(broker) {
	if (broker == null)
		broker = new SimpleBroker(console, this, {});
	var logger = {
		log: console.log,
		debugmsg: console.log		
	}
	CommonEnv.call(this, logger, broker);
	if (typeof(FlasckServices) !== 'undefined') {
		FlasckServices.configure(this);
	}
}

JSEnv.prototype = new CommonEnv();
JSEnv.prototype.constructor = JSEnv;

JSEnv.prototype.addHistory = function(state, title, url) {
	history.pushState(state, title, url);
}

//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = JSEnv;
} else {
	window.JSEnv = JSEnv;
}