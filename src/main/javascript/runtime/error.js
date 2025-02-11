class FLError extends Error {
	constructor(msg) {
    	super(msg);
    	this.name = "FLError";
	}
	
	_compare(_cxt, other) {
		if (!(other instanceof FLError)) return false;
		if (other.message != this.message) return false;
		return true;
	}

	_throw() {
		return true;
	}

	_updateTemplate(_cxt) {
		_cxt.log("error: " + this.message);
		return this;
	}
}

FLError.eval = function(_cxt, msg) {
	return new FLError(msg);
}

export { FLError };