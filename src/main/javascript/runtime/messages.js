
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
Debug.prototype.toString = function() {
	return "Debug[" + this.msg + "]";
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
Send.prototype.dispatch = function(cx) {
	var args = this.args.slice();
	args.splice(0, 0, cx);
	var ret = this.obj.methods()[this.meth].apply(this.obj, args);
	return ret;
}
Send.prototype.toString = function() {
	return "Send[" + "]";
}

const Assign = function() {
}
Assign.eval = function(_cxt, obj, slot, expr) {
	const s = new Assign();
	s.obj = obj;
	s.slot = slot;
	s.expr = expr;
	return s;
}
Assign.prototype._compare = function(cx, other) {
	if (other instanceof Assign) {
		return cx.compare(this.obj, other.obj) && cx.compare(this.slot, other.slot) && cx.compare(this.expr, other.expr);
	} else
		return false;
}
Assign.prototype.dispatch = function(cx) {
	this.obj.state.set(this.slot, this.expr);
	return null;
}
Assign.prototype.toString = function() {
	return "Assign[" + "]";
}

//--EXPORT
if (typeof(module) !== 'undefined')
	module.exports = { Debug, Send, Assign };
else {
	window.Debug = Debug;
	window.Send = Send;
	window.Assign = Assign;
}