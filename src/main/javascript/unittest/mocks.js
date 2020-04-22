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
	var ms = ctr.methods();
	for (var i in ms) {
		this.methodNames[ms[i]] = this[ms[i]] = proxyMe(this, ms[i]);
	}
	this.methods = function() {
		return this.methodNames;
	}
};

MockContract.prototype.areYouA = function(ty) {
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
	const ih = args[args.length-1];
	args = args.slice(0, args.length-1);
	if (!this.expected[meth]) {
		_cxt.env.error(new Error("There are no expectations on " + this.ctr.name() + " for " + meth));
		return;
	}
	const exp = this.expected[meth];
	var matched = null;
	for (var i=0;i<exp.length;i++) {
		// TOOD: should see if exp[i].args[j] is a BoundVar
		// I think this would involve us unwrapping this "list compare" and comparing each argument one at a time
		// wait for it to come up though
		if (_cxt.compare(exp[i].args, args)) {
			matched = exp[i];
			break;
		}
	}
	if (!matched) {
		_cxt.env.error(new Error("Unexpected invocation: " + this.ctr.name() + "." + meth + " " + args));
		return;
	}
	matched.invoked++;
	if (matched.invoked > matched.allowed) {
		_cxt.env.error(new Error(this.ctr.name() + "." + meth + " " + args + " already invoked (allowed=" + matched.allowed +"; actual=" + matched.invoked +")"));
		return;
	}
	_cxt.log("Have invocation of", meth, "with", args);
	if (matched.handler instanceof BoundVar) {
		matched.handler.bindActual(ih);
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
	this.card.renderInto(cx, newdiv);
};

MockCard.prototype = new MockAgent();
MockCard.prototype.constructor = MockCard;

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
	var ms = ctr.methods();
	for (var i in ms) {
		this.methodNames[ms[i]] = this[ms[i]] = proxyMe(this, ms[i]);
	}
	this.methods = function() {
		return this.methodNames;
	}
};

MockHandler.prototype = new ExplodingIdempotentHandler();
MockHandler.prototype.constructor = MockHandler;

MockHandler.prototype.areYouA = MockContract.prototype.areYouA;
MockHandler.prototype.expect = MockContract.prototype.expect;
MockHandler.prototype.serviceMethod = MockContract.prototype.serviceMethod;
MockHandler.prototype.assertSatisfied = MockContract.prototype.assertSatisfied;

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = { MockContract, MockHandler, MockAgent, MockCard, Expectation, BoundVar, ExplodingIdempotentHandler };
else {
	window.MockContract = MockContract;
	window.MockHandler = MockHandler;
	window.MockAgent = MockAgent;
	window.MockCard = MockCard;
	window.Expectation = Expectation;
	window.BoundVar = BoundVar;
}