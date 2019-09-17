class FLError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "FLError";
  }
}

if (typeof(module) !== 'undefined')
	module.exports = FLError;
else
	window.FLError = FLError;