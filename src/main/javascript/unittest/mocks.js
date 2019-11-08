const MockContract = function(ctr) {
	this.ctr = ctr;
};

MockContract.prototype.areYouA = function(ty) {
	return this.ctr.name() == ty;
}