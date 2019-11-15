const FLClosure = require('./closure');
const FLCurry = require('./curry');
//--REQUIRE

// I think if nargs == 0, this wants to return a closure of meth on obj
// if nargs > 0, it wants to return a curry
const FLMakeSend = function(meth, obj, nargs) {
}

//--EXPORT
if (typeof(module) !== 'undefined') {
	module.exports = { FLMakeSend };
} else {
	window.FLMakeSend = FLMakeSend;
}