const JSEnv = function() {
    this.logger = console;
}

//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = JSEnv;
} else {
	window.JSEnv = JSEnv;
}