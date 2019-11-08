
//--REQUIRE
const Debug = function() {
}
Debug.eval = function(_cxt, msg) {
	const d = new Debug();
	d.msg = msg;
	return d;
}
Debug.prototype._compare = function(cx, other) {
	if (other instanceof Debug) {
		return other.msg == this.msg;
	} else
		return false;
}

const Send = function() {
}
Send.eval = function(_cxt, obj, meth, args) {
	const s = new Send();
	s.obj = obj;
	s.meth = meth;
	s.args = args;
	return s;
}
Send.prototype._compare = function(cx, other) {
	if (other instanceof Send) {
		return cx.compare(this.obj, other.obj) && cx.compare(this.meth, other.meth) && cx.compare(this.args, other.args);
	} else
		return false;
}

//--EXPORT
if (typeof(module) !== 'undefined')
	module.exports = { Debug, Send };
else {
	window.Debug = Debug;
	window.Send = Send;
}