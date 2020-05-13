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
    // In general, everything should already be fully evaluated, but we do allow expressions in templates
    value = _cxt.full(value);
    if (!value)
        value = '';
    const nodes = this._currentDiv.querySelectorAll("[data-flas-content='" + field + "']");
    for (var i=0;i<nodes.length;i++) {
        nodes[i].innerHTML = '';
        nodes[i].appendChild(document.createTextNode(value));
    }
}

FLCard.prototype._updateTemplate = function(_cxt, type, field, fn, templateName, value, _tc) {
    value = _cxt.full(value);
    const node = this._currentDiv.querySelector("[data-flas-" + type + "='" + field + "']");
    if (node != null) {
        // TODO: this is always deleting & appending - but the name of the method is "update"
        node.innerHTML = '';
        if (!value) // if undefined, we want nothing - even when we get around to updating, so make sure that still blanks it
        return;
        var t = document.getElementById(templateName);
        if (t != null) {
            var tmp = this._currentDiv;
            if (Array.isArray(value)) {
                for (var i=0;i<value.length;i++) {
                    this._addItem(_cxt, node, t, fn, value[i], _tc);
                }
            } else
                this._addItem(_cxt, node, t, fn, value, _tc);
            this._currentDiv = tmp;
        }
    }
}

FLCard.prototype._addItem = function(_cxt, parent, template, fn, value, _tc) {
    this._currentDiv = template.content.cloneNode(true);
    fn.call(this, _cxt, value, _tc);
    parent.appendChild(this._currentDiv);
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