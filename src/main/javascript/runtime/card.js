const FLCard = function(cx) {
    this._currentDiv = null;
}

FLCard.prototype.renderInto = function(_cxt, div) {
    div.innerHTML = '';
    this._currentDiv = div;
    if (this._template) {
        var t = document.getElementById(this._template);
        if (t != null) {
            var clone = t.content.cloneNode(true);
            this._updateDisplay(_cxt, clone);
            div.appendChild(clone);
        }
    }
}

FLCard.prototype._updateContent = function(_cxt, root, field, value) {
    // it should not be necesary to evaluate anything
    // we should not store partially evaluated items
    if (!value)
        value = '';
    const nodes = root.querySelectorAll("[data-flas-content='" + field + "']");
    for (var i=0;i<nodes.length;i++) {
        nodes[i].innerHTML = '';
        nodes[i].appendChild(document.createTextNode(value));
    }
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLCard;
else
	window.FLCard = FLCard;