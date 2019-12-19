const MockContract = function(ctr) {
	this.ctr = ctr;
};

MockContract.prototype.areYouA = function(ty) {
	return this.ctr.name() == ty;
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = MockContract;
else
	window.MockContract = MockContract;