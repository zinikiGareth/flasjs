import { CommonEnv } from '../runtime/flasjs.js';
import { SimpleBroker } from '../../resources/ziwsh.js';

const JSEnv = function(broker) {
	if (broker == null)
		broker = new SimpleBroker(console, this, {});
	var logger = {
		log: console.log,
		debugmsg: console.log		
	}
	CommonEnv.call(this, logger, broker);
}

JSEnv.prototype = new CommonEnv();
JSEnv.prototype.constructor = JSEnv;

JSEnv.prototype.addHistory = function(state, title, url) {
	history.pushState(state, title, url);
}

export { JSEnv }
