const { IdempotentHandler } = require('../../resources/ziwsh');
//--REQUIRE

const BoundVar = function() {
}

BoundVar.prototype.bindActual = function(obj) {
	if (this.actual) {
		throw Error("cannot rebind bound var");
	}
	this.actual = obj;
}
BoundVar.prototype.introduced = function() {
	if (!this.actual)
		throw Error("bound var has not yet been bound");
	return this.actual;
}

const Expectation = function(args, handler) {
	this.args = args;
	this.handler = handler;
	this.allowed = 1;
	this.invoked = 0;
}

Expectation.prototype.allow = function(n) {
	this.allowed = n;
}

const proxyMe = function(self, meth) {
	return function(cx, ...rest) {
		self.serviceMethod(cx, meth, rest);
	}
}

const MockContract = function(ctr) {
	this.ctr = ctr;
	this.expected = {};
	this.methodNames = {};
	var ms = ctr._methods();
	for (var i in ms) {
		this.methodNames[ms[i]] = this[ms[i]] = proxyMe(this, ms[i]);
	}
	this._methods = function() {
		return this.methodNames;
	}
};

MockContract.prototype._areYouA = function(cx, ty) {
	return this.ctr.name() == ty;
}

MockContract.prototype.expect = function(meth, args, handler) {
	if (!this.expected[meth])
		this.expected[meth] = [];
	if (!this.ctr[meth] || !this.ctr[meth].nfargs) {
		throw new Error("EXP\n  " + this.ctr.name() + " does not have a method " + meth);
	}
	const expArgs = this.ctr[meth].nfargs();
	if (args.length != expArgs) {
		throw new Error("EXP\n  " + this.ctr.name() + "." + meth + " expects " + expArgs + " parameters, not " + args.length);
	}

	const exp = new Expectation(args, handler);
	this.expected[meth].push(exp);
	return exp;
}

MockContract.prototype.serviceMethod = function(_cxt, meth, args) {
	if (meth === 'success' || meth === 'failure')
		return; // these should really just be part of the protocol
	const ih = args[args.length-1];
	args = args.slice(0, args.length-1);
	if (!this.expected[meth]) {
		_cxt.env.error(new Error("There are no expectations on " + this.ctr.name() + " for " + meth));
		return;
	}
	const exp = this.expected[meth];
	var pending = null;
	for (var i=0;i<exp.length;i++) {
		// TOOD: should see if exp[i].args[j] is a BoundVar
		// I think this would involve us unwrapping this "list compare" and comparing each argument one at a time
		// wait for it to come up though
		if (_cxt.compare(exp[i].args, args)) {
			var matched = exp[i];
			if (matched.invoked == matched.allowed) {
				pending = new Error(this.ctr.name() + "." + meth + " " + args + " already invoked (allowed=" + matched.allowed +"; actual=" + matched.invoked +")");
				continue; // there may be another that matches
			}
			matched.invoked++;
			_cxt.log("Have invocation of", meth, "with", args);
			if (matched.handler instanceof BoundVar) {
				matched.handler.bindActual(ih);
			}
			return;
		}
	}
	if (pending) {
		_cxt.env.error(pending);
		return;
	} else {
		_cxt.env.error(new Error("Unexpected invocation: " + this.ctr.name() + "." + meth + " " + args));
		return;
	}
}

MockContract.prototype.assertSatisfied = function(_cxt) {
	var msg = "";
	for (var meth in this.expected) {
		if (!this.expected.hasOwnProperty(meth))
			continue;
		var exp = this.expected[meth];
		for (var i=0;i<exp.length;i++) {
			if (exp[i].invoked != exp[i].allowed)
				msg += "  " + this.ctr.name() + "." + meth + " <" + i +">\n";
		}
	}
	if (msg)
		throw new Error("UNUSED\n" + msg);
}

const MockFLObject = function(obj) {
	this.obj = obj;
}

MockFLObject.prototype._currentDiv = function() {
	if (this.div)
		return this.div;
	else
		throw Error("You must render the object first");
}

MockFLObject.prototype._currentRenderTree = function() {
	if (this.rt)
		return this.rt.result.single;
	else
		throw Error("You must render the object first");
}

const MockAgent = function(agent) {
	this.agent = agent;
};

MockAgent.prototype.sendTo = function(_cxt, contract, msg, args) {
	const ctr = this.agent._contracts.contractFor(_cxt, contract);
	const inv = Array.from(args);
	inv.splice(0, 0, _cxt);
	return ctr[msg].apply(ctr, inv);
};

const MockCard = function(cx, card) {
	this.card = card;
	const newdiv = document.createElement("div");
	newdiv.setAttribute("id", cx.nextDocumentId());
	document.body.appendChild(newdiv);
	this.card._renderInto(cx, newdiv);
};

MockCard.prototype.sendTo = function(_cxt, contract, msg, args) {
	const ctr = this.card._contracts.contractFor(_cxt, contract);
	const inv = Array.from(args);
	inv.splice(0, 0, _cxt);
	return ctr[msg].apply(ctr, inv);
};

MockCard.prototype._currentDiv = function() {
	return this.card._currentDiv();
}

MockCard.prototype._currentRenderTree = function() {
	return this.card._renderTree;
}

MockCard.prototype._underlying = function(_cxt) {
	return this.card;
}

const ExplodingIdempotentHandler = function(cx) {
	this.cx = cx;
	this.successes = { expected: 0, actual: 0 };
	this.failures = [];
};

ExplodingIdempotentHandler.prototype = new IdempotentHandler();
ExplodingIdempotentHandler.prototype.constructor = ExplodingIdempotentHandler;

ExplodingIdempotentHandler.prototype.success = function(cx) {
    cx.log("success");
};

ExplodingIdempotentHandler.prototype.failure = function(cx, msg) {
	cx.log("failure: " + msg);
	for (var i=0;i<this.failures.length;i++) {
		const f = this.failures[i];
		if (f.msg === msg) {
			f.actual++;
			return;
		}
	}
	this.failures.push({msg, expected: 0, actual: 1});
};

ExplodingIdempotentHandler.prototype.expectFailure = function(msg) {
	this.cx.log("expect failure: " + msg);
	this.failures.push({msg, expected: 1, actual: 0});
};

ExplodingIdempotentHandler.prototype.assertSatisfied = function() {
	var msg = "";
    for (var i=0;i<this.failures.length;i++) {
		const f = this.failures[i];
		if (f.expected === 0) {
			msg += "  failure: unexpected IH failure: " + f.msg;
		} else if (f.expected != f.actual) {
			msg += "  failure: " + f.msg + " (expected: " + f.expected + ", actual: " + f.actual +")\n";
		}
	}
	if (msg)
		throw new Error("HANDLERS\n" + msg);
};

const MockHandler = function(ctr) {
	this.successes = { expected: 0, actual: 0 };
	this.failures = [];
	this.ctr = ctr;
	this.expected = {};
	this.methodNames = {};
	var ms = ctr._methods();
	for (var i in ms) {
		this.methodNames[ms[i]] = this[ms[i]] = proxyMe(this, ms[i]);
	}
	this._methods = function() {
		return this.methodNames;
	}
};

MockHandler.prototype = new ExplodingIdempotentHandler();
MockHandler.prototype.constructor = MockHandler;

MockHandler.prototype._areYouA = MockContract.prototype._areYouA;
MockHandler.prototype.expect = MockContract.prototype.expect;
MockHandler.prototype.serviceMethod = MockContract.prototype.serviceMethod;
MockHandler.prototype.assertSatisfied = MockContract.prototype.assertSatisfied;

const MockAjax = function(_cxt, baseUri) {
	this.baseUri = baseUri;
	this.expect = { subscribe: [] }
}
MockAjax.prototype.expectSubscribe = function(_cxt, path) {
	var mas = new MockAjaxSubscriber(_cxt, path);
	this.expect.subscribe.push(mas);
	return mas;
}
MockAjax.prototype.pump = function(_cxt) {
	for (var i=0;i<this.expect.subscribe.length;i++) {
		this.expect.subscribe[i].dispatch(_cxt, this.baseUri, _cxt.env.activeSubscribers);
	}
}

const MockAjaxSubscriber = function(_cxt, path) {
	this.path = path;
	this.responses = [];
	this.nextResponse = 0;
}
MockAjaxSubscriber.prototype.response = function(_cxt, val) {
	this.responses.push(val);
}
MockAjaxSubscriber.prototype.dispatch = function(_cxt, baseUri, subscribers) {
	if (this.nextResponse >= this.responses.length)
		return;
	for (var i=0;i<subscribers.length;i++) {
		if (this.matchAndSend(_cxt, baseUri, subscribers[i]))
			return;
	}
	// no message - is this an error or just one of those things?
}
MockAjaxSubscriber.prototype.matchAndSend = function(_cxt, baseUri, sub) {
	if (sub.uri.toString() == new URL(this.path, baseUri).toString()) {
		var resp = this.responses[this.nextResponse++];
		resp = _cxt.full(resp);
		if (resp instanceof FLError) {
			// I think we need to report it and fail the test
			_cxt.log(resp);
			return true;
		}
		var msg;
		if (resp instanceof AjaxMessage) {
			msg = resp;
		} else {
			msg = new AjaxMessage(_cxt);
			msg.state.set('headers', []);
			if (typeof(resp) === "string")
				msg.state.set('body', resp);
			else
				msg.state.set('body', JSON.stringify(resp));
		}
		_cxt.env.queueMessages(_cxt, Send.eval(_cxt, sub.handler, "message", [msg], null));
		_cxt.env.dispatchMessages(_cxt);
		return true;
	} else
		return false;
}

// The service that attempts to connect ...
const MockAjaxService = function() {
}
MockAjaxService.prototype.subscribe = function(_cxt, uri, options, handler) {
	if (uri instanceof FLURI)
		uri = uri.uri;
	_cxt.env.activeSubscribers.push({ uri, options, handler });
}

const MockAppl = function(_cxt, clz) {
	const newdiv = document.createElement("div");
	newdiv.setAttribute("id", _cxt.nextDocumentId());
	document.body.appendChild(newdiv);
	this.appl = new clz._Application(_cxt, newdiv);
	this.appl._updateDisplay(_cxt, this.appl._currentRenderTree());
}
MockAppl.prototype.route = function(_cxt, r, andThen) {
	this.appl.gotoRoute(_cxt, r, () => {
		this.appl._updateDisplay(_cxt, this.appl._currentRenderTree());
		andThen();
	});
}
MockAppl.prototype.userLoggedIn = function(_cxt, u) {
	this.appl.securityModule.userLoggedIn(_cxt, this.appl, u);
}
MockAppl.prototype.bindCards = function(_cxt, iv) {
	if (!iv)
		return;
	var binding = {};
	binding["main"] = this.appl.cards["main"];
	iv.bindActual({ routes: binding });
}
MockAppl.prototype._currentRenderTree = function() {
	return this.appl._currentRenderTree();
}
//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = { MockContract, MockFLObject, MockHandler, MockAgent, MockCard, Expectation, BoundVar, ExplodingIdempotentHandler, MockAjax, MockAppl };
else {
	window.MockContract = MockContract;
	window.MockFLObject = MockFLObject;
	window.MockHandler = MockHandler;
	window.MockAgent = MockAgent;
	window.MockCard = MockCard;
	window.MockAjax = MockAjax;
	window.MockAppl = MockAppl;
	window.Expectation = Expectation;
	window.BoundVar = BoundVar;
}