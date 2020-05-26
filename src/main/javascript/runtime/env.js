const FLContext = require('./flcxt');
const { CallMe, Repeater, ContainerRepeater } = require('../container/repeater');
const FLError = require('../runtime/error');
//--REQUIRE

const CommonEnv = function(logger, broker) {
    if (!logger) // when used as a constructor
        return;
    this.contracts = broker.contracts;
    this.structs = {};
    this.objects = {};
    this.logger = logger;
    this.broker = broker;
	this.nextDivId = 1;
	this.divSince = this.nextDivId;
	this.evid = 1;
    this.cards = [];
    this.contracts["CallMe"] = CallMe;
    this.contracts["Repeater"] = Repeater;
    broker.register("Repeater", new ContainerRepeater());
}

CommonEnv.prototype.clear = function() {
	document.body.innerHTML = '';
}

CommonEnv.prototype.handleMessages = function(_cxt, msg) {
	if (this.errors.length != 0)
		throw this.errors[0];
	msg = _cxt.full(msg);
	if (!msg || msg instanceof FLError)
		return;
	else if (msg instanceof Array) {
		for (var i=0;i<msg.length;i++) {
			this.handleMessages(_cxt, msg[i]);
		}
	} else if (msg) {
		var ret = msg.dispatch(_cxt);
		if (ret)
			this.handleMessages(_cxt, ret);
	}
}

CommonEnv.prototype.newContext = function() {
	return new FLContext(this, this.broker);
}


//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = CommonEnv;
} else {
	window.CommonEnv = CommonEnv;
}