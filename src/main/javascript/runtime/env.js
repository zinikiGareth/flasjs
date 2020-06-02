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
    this.queue = [];
    broker.register("Repeater", new ContainerRepeater());
}

CommonEnv.prototype.clear = function() {
	document.body.innerHTML = '';
}

CommonEnv.prototype.queueMessages = function(_cxt, msg) {
    this.queue.push(msg);
    var self = this;
    setTimeout(() => self.dispatchMessages(_cxt), 0);
}

CommonEnv.prototype.dispatchMessages = function(_cxt) {
    while (this.queue.length > 0) {
        var more = this.queue.shift();
        while (more && (!Array.isArray(more) || more.length > 0)) {
            more = this.handleMessages(_cxt, more);
        }
    }
}

CommonEnv.prototype.handleMessages = function(_cxt, msg) {
    msg = _cxt.full(msg);
	if (!msg || msg instanceof FLError)
        return;
	else if (msg instanceof Array) {
        var ret = [];
        for (var i=0;i<msg.length;i++) {
            var m = this.handleMessages(_cxt, msg[i]);
            if (m && (!Array.isArray(m) || m.length > 0))
                ret.push(m);
        }
        return ret;
	} else if (msg) {
		return msg.dispatch(_cxt);
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