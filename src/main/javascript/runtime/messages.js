const { IdempotentHandler } = require('../../resources/ziwsh');
const { AssignItem } = require('./lists');
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
Debug.prototype.dispatch = function(cx) {
	cx.log(this.msg);
	return null;
}
Debug.prototype.toString = function() {
	return "Debug[" + this.msg + "]";
}

const Send = function() {
}
Send.eval = function(_cxt, obj, meth, args, handle) {
	const s = new Send();
	s.obj = obj;
	s.meth = meth;
	s.args = args;
	s.handle = handle;
	return s;
}
Send.prototype._full = function(cx) {
	this.obj = cx.full(this.obj);
	this.meth = cx.full(this.meth);
	this.args = cx.full(this.args);
	this.handle = cx.full(this.handle);
}
Send.prototype._compare = function(cx, other) {
	if (other instanceof Send) {
		return cx.compare(this.obj, other.obj) && cx.compare(this.meth, other.meth) && cx.compare(this.args, other.args);
	} else
		return false;
}
Send.prototype.dispatch = function(cx) {
	this._full(cx);
	if (this.obj instanceof ResponseWithMessages) {
		// build an array of messages with the RWM ones first and "me" last
		const ret = ResponseWithMessages.messages(cx, this.obj);
		// TODO: consider args and handle
		ret.push(Send.eval(cx, ResponseWithMessages.response(cx, this.obj), this.meth, this.args, this.handle));
		return ret;
	}
	var args = this.args.slice();
	args.splice(0, 0, cx);
	if (this.handle) {
		args.splice(args.length, 0, this.handle);
	} else {
		args.splice(args.length, 0, new IdempotentHandler());
	}
	var ret = this.obj._methods()[this.meth].apply(this.obj, args);
	if (this.obj._updateDisplay)
		cx.env.queueMessages(cx, [new UpdateDisplay(cx, this.obj)]);
	else if (this.obj._card && this.obj._card._updateDisplay)
		cx.env.queueMessages(cx, [new UpdateDisplay(cx, this.obj._card)]);
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
Assign.prototype._full = function(cx) {
	this.obj = cx.full(this.obj);
	this.slot = cx.full(this.slot);
	this.expr = cx.full(this.expr);
}
Assign.prototype._compare = function(cx, other) {
	if (other instanceof Assign) {
		return cx.compare(this.obj, other.obj) && cx.compare(this.slot, other.slot) && cx.compare(this.expr, other.expr);
	} else
		return false;
}
Assign.prototype.dispatch = function(cx) {
	// it's possible that obj is a send or something so consider dispatching it first
	var msgs = [];
	var target = this.obj;
	if (target.dispatch) {
		// TODO: I feel this *could* return a RWM, but it currently doesn't
		var rwm = this.obj.dispatch(cx);
		target = rwm;
	}
	if (this.expr instanceof ResponseWithMessages) {
		msgs.unshift(ResponseWithMessages.messages(cx, this.expr));
		this.expr = ResponseWithMessages.response(cx, this.expr);
	}
	target.state.set(this.slot, this.expr);
	return msgs;
}
Assign.prototype.toString = function() {
	return "Assign[" + "]";
};

const AssignCons = function() {
}
AssignCons.eval = function(_cxt, obj, expr) {
	const s = new AssignCons();
	s.obj = obj;
	s.expr = expr;
	return s;
}
AssignCons.prototype._full = function(cx) {
	this.obj = cx.full(this.obj);
	this.expr = cx.full(this.expr);
}
AssignCons.prototype._compare = function(cx, other) {
	if (other instanceof AssignCons) {
		return cx.compare(this.obj, other.obj) && cx.compare(this.expr, other.expr);
	} else
		return false;
}
AssignCons.prototype.dispatch = function(cx) {
	// it's possible that obj is a send or something so consider dispatching it first
	var msgs = [];
	var target = this.obj;
	if (target.dispatch) {
		// TODO: I feel this *could* return a RWM, but it currently doesn't
		var rwm = this.obj.dispatch(cx);
		target = rwm;
	}
	if (!(target instanceof AssignItem)) {
		throw Error("No, it needs to be an Item");
	}
	if (this.expr instanceof ResponseWithMessages) {
		msgs.unshift(ResponseWithMessages.messages(cx, this.expr));
		this.expr = ResponseWithMessages.response(cx, this.expr);
	}
	target.set(this.expr);
	return msgs;
}
AssignCons.prototype.toString = function() {
	return "AssignCons[" + "]";
};

const ResponseWithMessages = function(cx, obj, msgs) {
	this.obj = obj;
	this.msgs = msgs;
}
ResponseWithMessages.prototype._full = function(cx) {
	this.obj = cx.full(this.obj);
	this.msgs = cx.full(this.msgs);
}
ResponseWithMessages.response = function(cx, rwm) {
	if (rwm instanceof ResponseWithMessages)
		return rwm.obj;
	else
		return rwm;
}
ResponseWithMessages.messages = function(cx, rwm) {
	if (rwm instanceof ResponseWithMessages)
		return rwm.msgs;
	else
		return null;
}

const UpdateDisplay = function(cx, card) {
	this.card = card;
}
UpdateDisplay.prototype.dispatch = function(cx) {
	if (this.card._updateDisplay)
		cx.needsUpdate(this.card);
}
UpdateDisplay.prototype.toString = function() {
	return "UpdateDisplay";
}

//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined')
	module.exports = { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay };
else {
	window.Debug = Debug;
	window.Send = Send;
	window.Assign = Assign;
	window.ResponseWithMessages = ResponseWithMessages;
	window.UpdateDisplay = UpdateDisplay;
}