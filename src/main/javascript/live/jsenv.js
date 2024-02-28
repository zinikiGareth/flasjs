import { CommonEnv } from '../runtime/flasjs';
import { SimpleBroker } from '../../resources/ziwsh';

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

export { JSEnv }
