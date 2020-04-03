const { IdempotentHandler } = require('../../resources/ziwsh');
//--REQUIRE

const Expectation = function(args) {
	this.args = args;
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

MockContract.prototype.expect = function(meth, args) {
	if (!this.expected[meth])
		this.expected[meth] = [];
	if (!this.ctr[meth] || !this.ctr[meth].nfargs) {
		throw new Error("EXP\n  " + this.ctr.name() + " does not have a method " + meth);
	}
	const expArgs = this.ctr[meth].nfargs();
	if (args.length != expArgs) {
		throw new Error("EXP\n  " + this.ctr.name() + "." + meth + " expects " + expArgs + " parameters, not " + args.length);
	}

	const exp = new Expectation(args);
	this.expected[meth].push(exp);
	return exp;
}

MockContract.prototype.serviceMethod = function(_cxt, meth, args) {
	const ih = args[args.length-1];
	args = args.slice(0, args.length-1);
	if (!this.expected[meth])
		throw new Error("There are no expectations on " + this.ctr.name() + " for " + meth);
	const exp = this.expected[meth];
	var matched = null;
	for (var i=0;i<exp.length;i++) {
		if (_cxt.compare(exp[i].args, args)) {
			matched = exp[i];
			break;
		}
	}
	if (!matched) {
		throw new Error("Unexpected invocation: " + this.ctr.name() + "." + meth + " " + args);
	}
	matched.invoked++;
	if (matched.invoked > matched.allowed) {
		throw new Error(this.ctr.name() + "." + meth + " " + args + " already invoked (allowed=" + matched.allowed +"; actual=" + matched.invoked +")");
	}
	_cxt.log("Have invocation of", meth, "with", args);
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

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = { MockContract, MockAgent, Expectation, ExplodingIdempotentHandler };
else {
	window.MockContract = MockContract;
	window.MockAgent = MockAgent;
	window.Expectation = Expectation;
}