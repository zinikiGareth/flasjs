const { IdempotentHandler } = require('../../resources/ziwsh');
const { Send } = require('../runtime/messages');
//--REQUIRE

const CallMe = function(cx) {
};

CallMe.prototype = new IdempotentHandler();
CallMe.prototype.constructor = CallMe;

const Repeater = function(cx) {
}

Repeater._methods = function() {
    return ['callMe'];
};

const ContainerRepeater = function() {
}

ContainerRepeater.prototype.callMe = function(cx, callback) {
    return Send.eval(cx, callback, "call", []);
}

//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined')
	module.exports = { CallMe, Repeater, ContainerRepeater };
else {
	window.CallMe = CallMe;
	window.Repeater = Repeater;
}