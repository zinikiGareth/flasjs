const { IdempotentHandler } = require('../../resources/ziwsh');
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
    cx.log("hello, world");
}

//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined')
	module.exports = { CallMe, Repeater, ContainerRepeater };
else {
	window.CallMe = CallMe;
	window.Repeater = Repeater;
}