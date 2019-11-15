
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

FieldsContainer.prototype.toString = function() {
	return "Fields[" + this.msg + "]";
}

//--EXPORT
if (typeof(module) !== 'undefined')
	module.exports = { FieldsContainer };
else {
	window.FieldsContrainer = FieldsContainer;
}