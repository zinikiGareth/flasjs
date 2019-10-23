class _FLError extends Error {
	constructor(msg) {
    	super(msg);
    	this.name = "FLError";
	}
	
	_compareTo(other) {
		if (!other instanceof _FLError) return false;
		if (other.message != this.message) return false;
		return true;
	}
}

var FLError = function(_cxt, msg) {
	return new _FLError(msg);
}

//--EXPORT
if (typeof(module) !== 'undefined')
	module.exports = FLError;
else
	window.FLError = FLError;