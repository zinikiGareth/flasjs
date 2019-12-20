const Expectation = function(args) {
	this.args = args;
	this.allowed = 1;
	this.invoked = 0;
}

Expectation.prototype.allow = function(n) {
	this.allowed = n;
}

const MockContract = function(ctr) {
	this.ctr = ctr;
	this.expected = {};
};

MockContract.prototype.areYouA = function(ty) {
	return this.ctr.name() == ty;
}

MockContract.prototype.expect = function(meth, args) {
	if (!this.expected[meth])
		this.expected[meth] = [];
	const exp = new Expectation(args);
	this.expected[meth].push(exp);
	return exp;
}

MockContract.prototype.serviceMethod = function(_cxt, meth, args) {
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
	console.log("Have invocation of", meth, "with", args);
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = { MockContract, Expectation };
else {
	window.MockContract = MockContract;
	window.Expectation = Expectation;
}