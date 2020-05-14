const FLCard = function(cx) {
    this._currentDiv = null;
    this._renderTree = {};
}

FLCard.prototype._renderInto = function(_cxt, div) {
    div.innerHTML = '';
    if (this._template) {
        var t = document.getElementById(this._template);
        if (t != null) {
            this._currentDiv = t.content.cloneNode(true);
            var ncid = _cxt.nextDocumentId();
            this._currentDiv.firstElementChild.id = ncid;
            this._renderTree['_id'] = ncid;
            this._updateDisplay(_cxt, this._renderTree);
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

FLCard.prototype._updateContent = function(_cxt, _renderTree, field, value) {
    // In general, everything should already be fully evaluated, but we do allow expressions in templates
    value = _cxt.full(value);
    if (!value)
        value = '';
    const node = this._currentDiv.querySelector("[data-flas-content='" + field + "']");
    var ncid = _cxt.nextDocumentId();
    node.id = ncid;
    _renderTree[field] = { _id: ncid };
    node.innerHTML = '';
    node.appendChild(document.createTextNode(value));
}

FLCard.prototype._updateStyle = function(_cxt, _renderTree, type, field, constant, ...rest) {
    var styles = '';
    if (constant)
        styles = constant;
    for (var i=0;i<rest.length;i+=2) {
        if (_cxt.isTruthy(rest[i]))
            styles += ' ' + rest[i+1];
    }
    const node = this._currentDiv.querySelector("[data-flas-" + type + "='" + field + "']");
    var ncid = _cxt.nextDocumentId();
    node.id = ncid;
    _renderTree[field] = { _id: ncid };
    node.className = styles;
}

FLCard.prototype._updateTemplate = function(_cxt, _renderTree, type, field, fn, templateName, value, _tc) {
    value = _cxt.full(value);
    const node = this._currentDiv.querySelector("[data-flas-" + type + "='" + field + "']");
    if (node != null) {
        var ncid = _cxt.nextDocumentId();
        node.id = ncid;
        _renderTree[field] = { _id: ncid };
        // TODO: this is always deleting & appending - but the name of the method is "update"
        node.innerHTML = '';
        if (!value) // if undefined, we want nothing - even when we get around to updating, so make sure that still blanks it
            return;
        var t = document.getElementById(templateName);
        if (t != null) {
            var tmp = this._currentDiv;
            if (Array.isArray(value)) {
                _renderTree[field].children = [];
                for (var i=0;i<value.length;i++) {
                    var rt  = {};
                    _renderTree[field].children.push(rt);
                    this._addItem(_cxt, rt, node, t, fn, value[i], _tc);
                }
            } else {
                var rt  = {};
                _renderTree[field].single = rt;
                this._addItem(_cxt, rt, node, t, fn, value, _tc);
            }
            this._currentDiv = tmp;
        }
    }
}

FLCard.prototype._addItem = function(_cxt, _renderTree, parent, template, fn, value, _tc) {
    this._currentDiv = template.content.cloneNode(true);
    var ncid = _cxt.nextDocumentId();
    this._currentDiv.firstElementChild.id = ncid;
    _renderTree._id = ncid;
    fn.call(this, _cxt, _renderTree, value, _tc);
    parent.appendChild(this._currentDiv);
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLCard;
else
	window.FLCard = FLCard;