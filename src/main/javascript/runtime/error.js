class FLError extends Error {
	constructor(msg) {
    	super(msg);
    	this.name = "FLError";
	}
	
	_compare(cx, other) {
		if (!(other instanceof FLError)) return false;
		if (other.message != this.message) return false;
		return true;
	}
}

FLError.eval = function(_cxt, msg) {
	return new FLError(msg);
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLError;
else
	window.FLError = FLError;