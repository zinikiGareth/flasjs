const FLCard = require('./card');
//--REQUIRE

const FLObject = function(cx) {
}
FLObject.prototype._updateTemplate = FLCard.prototype._updateTemplate;
FLObject.prototype._addItem = FLCard.prototype._addItem;
FLObject.prototype._updateContent = FLCard.prototype._updateContent;
FLObject.prototype._updateContainer = FLCard.prototype._updateContainer;
FLObject.prototype._updateStyle = FLCard.prototype._updateStyle;


//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLObject;
else
	window.FLObject = FLObject;
