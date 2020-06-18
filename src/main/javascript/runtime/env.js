const FLContext = require('./flcxt');
const { CallMe, Repeater, ContainerRepeater } = require('../container/repeater');
const { Random } = require('./random');
const FLError = require('../runtime/error');
//--REQUIRE

const CommonEnv = function(logger, broker) {
    if (!logger) // when used as a constructor
        return;
    this.contracts = broker.contracts;
    this.structs = {};
    this.objects = {};
    this.objects['Random'] = Random;
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
    var set = [];
    _cxt.updateCards = set;
    while (this.queue.length > 0) {
        var more = this.queue.shift();
        while (more && (!Array.isArray(more) || more.length > 0)) {
            more = this.handleMessages(_cxt, more);
        }
    }
    delete _cxt.updateCards;
    set.forEach(card => card._updateDisplay(_cxt, card._renderTree));
}

CommonEnv.prototype.handleMessages = function(_cxt, msg) {
    var ret = [];
    this.handleMessagesWith(_cxt, msg, ret);
    return ret;
}

CommonEnv.prototype.handleMessagesWith = function(_cxt, msg, ret) {
    msg = _cxt.full(msg);
    if (!msg)
        return [];
    else if (msg instanceof FLError) {
        this.logger.log(msg);
        return [];
    } else if (msg instanceof Array) {
        for (var i=0;i<msg.length;i++) {
            this.handleMessagesWith(_cxt, msg[i], ret);
        }
	} else if (msg) {
        var m = msg.dispatch(_cxt);
        m = _cxt.full(m);
        this.addAll(ret, m);
    }
}

CommonEnv.prototype.addAll = function(ret, m) {
    if (m) {
        if (Array.isArray(m)) {
            m.forEach(x => this.addAll(ret, x));
        } else
            ret.push(m);
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