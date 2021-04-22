const FLContext = require('./flcxt');
const { FLBuiltin } = require('./builtin');
const { CallMe, Repeater, ContainerRepeater } = require('../container/repeater');
const { Random } = require('./random');
const { Crobag, CroEntry } = require('./crobag');
const { Image } = require('./image');
const { Link } = require('./link');
const { Calendar } = require('./time');
const FLError = require('../runtime/error');
//--REQUIRE

// should this be part of Ziniki?
const ZiIdURI = function(s) {
    this.uri = s;
}
ZiIdURI.fromWire = function(cx, om, fields) {
    return new ZiIdURI(fields["uri"]);
}
ZiIdURI.prototype._towire = function(wf) {
    wf._wireable = "org.ziniki.common.ZiIdURI";
    wf.uri = this.uri;
}
const CommonEnv = function(bridge, broker) {
    if (!bridge) // when used as a constructor
        return;
    this.contracts = broker.contracts;
    this.structs = {};
    this.structs['Link'] = Link;
    this.objects = {};
    this.objects['Random'] = Random;
    this.objects['FLBuiltin'] = FLBuiltin;
    this.objects['Crobag'] = Crobag;
    this.objects['CroEntry'] = CroEntry;
    this.objects['Image'] = Image;
    this.objects['org.ziniki.common.ZiIdURI'] = ZiIdURI; // hack that enables the Java name to be sent on the wire.  It probably shouldn't be; but should we send just a string or should we recognize ZiIdURI?
    this.objects['org.flasck.jvm.builtin.Crobag'] = Crobag; // hack that enables the Java name to be sent on the wire.  It probably shouldn't be.
    this.objects['org.flasck.jvm.builtin.CroEntry'] = CroEntry; // hack that enables the Java name to be sent on the wire.  It probably shouldn't be.
    this.objects['Calendar'] = Calendar;
    this.logger = bridge;
    this.broker = broker;
	this.nextDivId = 1;
	this.divSince = this.nextDivId;
	this.evid = 1;
    this.cards = [];
    this.queue = [];
    if (bridge.lock)
        this.locker = bridge;
    else
        this.locker = { lock: function() {}, unlock: function() {} };
}

CommonEnv.prototype.makeReady = function() {
    this.broker.register("Repeater", new ContainerRepeater());
}

CommonEnv.prototype.clear = function() {
	document.body.innerHTML = '';
}

CommonEnv.prototype.queueMessages = function(_cxt, msg) {
    this.locker.lock();
    this.queue.push(msg);
    var self = this;
    setTimeout(() => { self.dispatchMessages(_cxt); this.locker.unlock(); }, 0);
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
    set.forEach(card => {
        // This stops applications rendering so we can't do this
        // if (!card._renderTree)
        //     return;
        if (card._updateDisplay)
            card._updateDisplay(_cxt, card._renderTree);
        if (card._resizeDisplayElements)
            card._resizeDisplayElements(_cxt, card._renderTree);
    });
}

CommonEnv.prototype.handleMessages = function(_cxt, msg) {
    var msg = _cxt.full(msg);
    this.handleMessagesWith(_cxt, msg);
}

CommonEnv.prototype.handleMessagesWith = function(_cxt, msg) {
    msg = _cxt.full(msg);
    if (!msg)
        ;
    else if (msg instanceof FLError || typeof(msg) == 'string') {
        _cxt.log(msg);
    } else if (msg instanceof Array) {
        for (var i=0;i<msg.length;i++) {
            this.handleMessages(_cxt, msg[i]);
        }
	} else if (msg) {
        var ic = this.newContext();
        ic.updateCards = _cxt.updateCards;
        _cxt.log("dispatching message", msg);
        var m = msg.dispatch(ic);
        this.handleMessages(_cxt, m);
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

if (typeof(window) !== 'undefined') {
    window.addEventListener('resize', function(ev) {
        if (window.appl) {
            var keys = Object.keys(window.appl.cards);
            for (var i=0;i<keys.length;i++) {
                var card = window.appl.cards[keys[i]];
                card._resizeDisplayElements(env.newContext(), card._renderTree);
            }
        }
    });
}

//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = CommonEnv;
} else {
	window.CommonEnv = CommonEnv;
}