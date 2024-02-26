const { Send } = require('./messages');
//--REQUIRE

const ContainerRepeater = function() {
}

ContainerRepeater.prototype.callMe = function(cx, callback) {
    return Send.eval(cx, callback, "call", []);
}

//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined')
	module.exports = { ContainerRepeater };
else {
	window.ContainerRepeater = ContainerRepeater;
}