const { SimpleBroker } = require('../../resources/ziwsh');
const FLContext = require('../runtime/flcxt');
const FLError = require('../runtime/error');
//--REQUIRE

const UTRunner = function(logger) {
	this.logger = logger;
	this.contracts = {};
	this.structs = {};
	this.objects = {};
	this.broker = new SimpleBroker(logger, this, this.contracts);
	this.errors = [];
	this.nextDivId = 1;
}
UTRunner.prototype.clear = function() {
	document.body.innerHTML = '';
}
UTRunner.prototype.error = function(err) {
	this.errors.push(err);
}
UTRunner.prototype.assertSameValue = function(_cxt, e, a) {
	e = _cxt.full(e);
	a = _cxt.full(a);
	if (!_cxt.compare(e, a)) {
		throw new Error("NSV\n  expected: " + e + "\n  actual:   " + a);
	}
}
UTRunner.prototype.invoke = function(_cxt, inv) {
	inv = _cxt.full(inv);
	this.handleMessages(_cxt, inv);
}
UTRunner.prototype.send = function(_cxt, target, contract, msg, args) {
	var reply = target.sendTo(_cxt, contract, msg, args);
	reply = _cxt.full(reply);
	this.handleMessages(_cxt, reply);
}
UTRunner.prototype.event = function(_cxt, target, event) {
	// TODO: when we have templates, this should indirect as an event through the DIV & its event handler
	var reply = _cxt.handleEvent(target.card, event);
	reply = _cxt.full(reply);
	this.handleMessages(_cxt, reply);
}
UTRunner.prototype.match = function(_cxt, target, what, selector, contains, expected) {
	if (!target || !target.card || !target.card._currentDiv) {
		throw Error("MATCH\nThe card has no rendered content");
	}
	var actual = target.card._currentDiv.innerText.trim();
	actual = actual.replace(/\n/g, ' ');
	actual = actual.replace(/ +/, ' ');
	if (contains) {
		if (!actual.includes(expected))
			throw new Error("MATCH\n  expected to contain: " + expected + "\n  actual:   " + actual);
	} else {
		if (actual != expected)
			throw new Error("MATCH\n  expected: " + expected + "\n  actual:   " + actual);
	}
}
UTRunner.prototype.handleMessages = function(_cxt, msg) {
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
UTRunner.prototype.newContext = function() {
	return new FLContext(this, this.broker);
}
UTRunner.prototype.checkAtEnd = function() {
	if (this.errors.length > 0)
		throw this.errors[0];
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = UTRunner;
else
//--WINDOW
	window.UTRunner = UTRunner;