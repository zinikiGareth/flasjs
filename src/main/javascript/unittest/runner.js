const { SimpleBroker } = require('../../resources/ziwsh');
const FLContext = require('../runtime/flcxt');
const FLError = require('../runtime/error');
//--REQUIRE

const UTRunner = {};
UTRunner.assertSameValue = function(_cxt, e, a) {
	e = _cxt.full(e);
	a = _cxt.full(a);
	if (!_cxt.compare(e, a)) {
		throw new Error("NSV\n  expected: " + e + "\n  actual:   " + a);
	}
}
UTRunner.invoke = function(_cxt, inv) {
	inv = _cxt.full(inv);
	handleMessages(_cxt, inv);
}
UTRunner.send = function(_cxt, target, contract, msg, args) {
	var reply = target.sendTo(_cxt, contract, msg, args);
	reply = _cxt.full(reply);
	handleMessages(_cxt, reply);
}
const handleMessages = function(_cxt, msg) {
	if (!msg || msg instanceof FLError)
		return;
	else if (msg instanceof Array) {
		for (var i=0;i<msg.length;i++) {
			handleMessages(_cxt, msg[i]);
		}
	} else if (msg) {
		var ret = msg.dispatch(_cxt);
		if (ret)
			handleMessages(_cxt, ret);
	}
}
UTRunner.newContext = function(logger) {
	if (logger) {
		this.logger = logger;
	}
	return new FLContext(this, new SimpleBroker());
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = UTRunner;
else
//--WINDOW
	window.runner = UTRunner;