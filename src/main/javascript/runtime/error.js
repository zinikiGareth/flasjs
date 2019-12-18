class _FLError extends Error {
	constructor(msg) {
    	super(msg);
    	this.name = "FLError";
	}
	
	_compare(cx, other) {
		if (!(other instanceof _FLError)) return false;
		if (other.message != this.message) return false;
		return true;
	}
}

const FLError = {
}
FLError.eval = function(_cxt, msg) {
	return new _FLError(msg);
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLError;
else
	window.FLError = FLError;