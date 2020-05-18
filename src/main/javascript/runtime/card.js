const FLCard = function(cx) {
    this._renderTree = null;
    this._containedIn = null;
}

FLCard.prototype._renderInto = function(_cxt, div) {
    this._containedIn = div;
    div.innerHTML = '';
    if (this._template) {
        this._renderTree = {}
        var t = document.getElementById(this._template);
        if (t != null) {
            var cloned = t.content.cloneNode(true);
            var ncid = _cxt.nextDocumentId();
            cloned.firstElementChild.id = ncid;
            this._renderTree['_id'] = ncid;
            div.appendChild(cloned);
            this._updateDisplay(_cxt, this._renderTree);
        }
    }
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, div, this._template, this);
        this._attachHandlers(_cxt, div, "_", this); // unbound ones
    }
}

FLCard.prototype._currentDiv = function(cx) {
    if (this._renderTree)
        return document.getElementById(this._renderTree._id);
    else
        return this._containedIn;
}

FLCard.prototype._attachHandlers = function(_cxt, div, key, source) {
    const evcs = this._eventHandlers()[key];
    if (evcs) {
        for (var i in evcs) {
            var ldiv = div;
            var handlerInfo = evcs[i];
            if (handlerInfo.type)
                ldiv = div.querySelector("[data-flas-" + handlerInfo.type + "='" + handlerInfo.slot + "']");
            _cxt.attachEventToCard(this, handlerInfo, ldiv, { value: source });
        }
    }
}

FLCard.prototype._updateContent = function(_cxt, _renderTree, field, value) {
    // In general, everything should already be fully evaluated, but we do allow expressions in templates
    value = _cxt.full(value);
    if (!value)
        value = '';
    var div = document.getElementById(_renderTree._id);
    const node = div.querySelector("[data-flas-content='" + field + "']");
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
    var div = document.getElementById(_renderTree._id);
    const node = div.querySelector("[data-flas-" + type + "='" + field + "']");
    var ncid = _cxt.nextDocumentId();
    node.id = ncid;
    _renderTree[field] = { _id: ncid };
    node.className = styles;
}

FLCard.prototype._updateTemplate = function(_cxt, _renderTree, type, field, fn, templateName, value, _tc) {
    value = _cxt.full(value);
    var div = document.getElementById(_renderTree._id);
    const node = div.querySelector("[data-flas-" + type + "='" + field + "']");
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
        }
    }
}

FLCard.prototype._addItem = function(_cxt, _renderTree, parent, template, fn, value, _tc) {
    var div = template.content.cloneNode(true);
    var ncid = _cxt.nextDocumentId();
    div = div.firstElementChild;
    div.id = ncid;
    _renderTree._id = ncid;
    parent.appendChild(div);
    fn.call(this, _cxt, _renderTree, value, _tc);
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, div, template.id, value);
    }
}

FLCard.prototype._updateContainer = function(_cxt, _renderTree, field, value, fn) {
    value = _cxt.full(value);
    var div = document.getElementById(_renderTree._id);
    const node = div.querySelector("[data-flas-container='" + field + "']");
    var ncid = _cxt.nextDocumentId();
    node.id = ncid;
    _renderTree[field] = { _id: ncid };
    node.innerHTML = '';
    if (!value)
        return;
    _renderTree[field].children = [];
    for (var i=0;i<value.length;i++) {
        var e = value[i];
        var rt  = {};
        _renderTree[field].children.push(rt);
        fn.call(this, _cxt, rt, node, e);
    }
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLCard;
else
	window.FLCard = FLCard;