const FLCard = function(cx) {
    this._currentDiv = null;
}

FLCard.prototype._renderInto = function(_cxt, div) {
    div.innerHTML = '';
    if (this._template) {
        var t = document.getElementById(this._template);
        if (t != null) {
            this._currentDiv = t.content.cloneNode(true);
            this._updateDisplay(_cxt);
            div.appendChild(this._currentDiv);
        }
    }
    this._currentDiv = div;
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, div, this._template);
        this._attachHandlers(_cxt, div, "_"); // unbound ones
    }
}

FLCard.prototype._attachHandlers = function(_cxt, div, key) {
    const evcs = this._eventHandlers()[key];
    if (evcs) {
        for (var i in evcs) {
            _cxt.attachEventToCard(this, evcs[i]);
        }
    }
}

FLCard.prototype._updateContent = function(_cxt, field, value) {
    // it should not be necesary to evaluate anything
    // we should not store partially evaluated items
    if (!value)
        value = '';
    const nodes = this._currentDiv.querySelectorAll("[data-flas-content='" + field + "']");
    for (var i=0;i<nodes.length;i++) {
        nodes[i].innerHTML = '';
        nodes[i].appendChild(document.createTextNode(value));
    }
}

FLCard.prototype._updateTemplate = function(_cxt, type, field, fn, templateName, value) {
    const node = this._currentDiv.querySelector("[data-flas-" + type + "='" + field + "']");
    if (node != null) {
        var tmp = this._currentDiv;
        // TODO: this is always deleting & appending - but the name of the method is "update"
        node.innerHTML = '';
        var t = document.getElementById(templateName);
        if (t != null) {
            this._currentDiv = t.content.cloneNode(true);
            fn.call(this, _cxt, value);
            node.appendChild(this._currentDiv);
        }
        this._currentDiv = tmp;
    }
}

FLCard.prototype._updateStyle = function(_cxt, type, field, constant, ...rest) {
    var styles = '';
    if (constant)
        styles = constant;
    for (var i=0;i<rest.length;i+=2) {
        if (_cxt.isTruthy(rest[i]))
            styles += ' ' + rest[i+1];
    }
    const nodes = this._currentDiv.querySelectorAll("[data-flas-" + type + "='" + field + "']");
    for (var i=0;i<nodes.length;i++) {
        nodes[i].className = styles;
    }
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLCard;
else
	window.FLCard = FLCard;