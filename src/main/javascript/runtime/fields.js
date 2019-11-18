
//--REQUIRE
const FieldsContainer = function() {
	this.dict = {};
}

FieldsContainer.prototype.set = function(fld, val) {
	this.dict[fld] = val;
}

FieldsContainer.prototype.get = function(fld) {
	return this.dict[fld];
}

FieldsContainer.prototype._compare = function(cx, other) {
	if (Object.keys(this.dict).length != Object.keys(other.dict).length)
		return false;
	for (var k in this.dict) {
		if (!other.dict.hasOwnProperty(k))
			return false;
		else if (!cx.compare(this.dict[k], other.dict[k]))
			return false;
	}
	return true;
}

FieldsContainer.prototype.toString = function() {
	return "Fields[" + this.msg + "]";
}

//--EXPORT
if (typeof(module) !== 'undefined')
	module.exports = { FieldsContainer };
else {
	window.FieldsContrainer = FieldsContainer;
}