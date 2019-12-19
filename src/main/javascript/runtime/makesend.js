const { Send } = require('./messages');
//--REQUIRE

const FLMakeSend = function(meth, obj, nargs, /* optional */ args) {
	this.meth = meth;
	this.obj = obj;
	this.nargs = nargs;
	if (args)
		this.current = args;
	else
		this.current = [];
}

FLMakeSend.prototype.apply = function(cx, args) {
	var all = this.current.slice();
	for (var i=1;i<args.length;i++)
		all.push(args[i]);
	if (all.length == this.nargs) {
		return Send.eval(cx, this.obj, this.meth, all);
	} else {
		return new FLMakeSend(this.meth, this.obj, this.nargs, all);
	}
}

FLMakeSend.prototype.nfargs = function() { return this.nargs; }

FLMakeSend.prototype.toString = function() {
	return "MakeSend[" + this.nargs + "]";
}

//--EXPORT
/* istanbul ignore next */
if (typeof(module) !== 'undefined') {
	module.exports = FLMakeSend;
} else {
	window.FLMakeSend = FLMakeSend;
}