const FLCard = function(cx) {
    this._currentDiv = null;
}

FLCard.prototype.renderInto = function(cx, div) {
    div.innerHTML = '';
    this._currentDiv = div;
    if (this._template) {
        var t = document.getElementById(this._template);
        if (t != null) {
            var clone = t.content.cloneNode(true);
            // TODO: we need to set things here based on card state
            div.appendChild(clone);
        }
    }
}
//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLCard;
else
	window.FLCard = FLCard;