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
    // attach the default handlers to the card
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, this._renderTree, div, "_", null, 1, this); // unbound ones
    }
}

FLCard.prototype._currentDiv = function(cx) {
    if (this._renderTree)
        return document.getElementById(this._renderTree._id);
    else
        return this._containedIn;
}

FLCard.prototype._attachHandlers = function(_cxt, rt, div, key, field, option, source) {
    const evcs = this._eventHandlers()[key];
    if (evcs) {
        for (var i in evcs) {
            var ldiv = div;
            var handlerInfo = evcs[i];
            if (!handlerInfo.slot) {
                if (field)
                    continue;
            } else {
                if (field != handlerInfo.slot)
                    continue;
            }
            if (handlerInfo.option && handlerInfo.option != option)
                continue;
            // if (handlerInfo.type)
            //     ldiv = div.querySelector("[data-flas-" + handlerInfo.type + "='" + handlerInfo.slot + "']");
            if (rt && rt.handlers) {
                for (var i=0;i<rt.handlers.length;i++) {
                    var rh = rt.handlers[i];
                    _cxt.env.logger.log("removing event listener from " + ldiv.id + " for " + rh.hi.event._eventName);
                    ldiv.removeEventListener(rh.hi.event._eventName, rh.eh);
                }
                delete rt.handlers;
            }
            var eh = _cxt.attachEventToCard(this, handlerInfo, ldiv, { value: source });
            if (eh && rt) {
                if (!rt.handlers) {
                    rt.handlers = [];
                }
                rt.handlers.push({ hi: handlerInfo, eh: eh });
            }
        }
    }
}

FLCard.prototype._updateContent = function(_cxt, rt, templateName, field, option, source, value) {
    // In general, everything should already be fully evaluated, but we do allow expressions in templates
    value = _cxt.full(value);
    if (!value)
        value = '';
    var div = document.getElementById(rt._id);
    const node = div.querySelector("[data-flas-content='" + field + "']");
    if (!node.id) {
        var ncid = _cxt.nextDocumentId();
        node.id = ncid;
        rt[field] = { _id: ncid };
    }
    node.innerHTML = '';
    node.appendChild(document.createTextNode(value));
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, rt[field], node, templateName, field, option, source);
    }
}

FLCard.prototype._updateStyle = function(_cxt, rt, templateName, type, field, option, source, constant, ...rest) {
    var styles = '';
    if (constant)
        styles = constant;
    for (var i=0;i<rest.length;i+=2) {
        if (_cxt.isTruthy(rest[i]))
            styles += ' ' + rest[i+1];
    }
    var div = document.getElementById(rt._id);
    var node;
    if (type != null) {
        node = div.querySelector("[data-flas-" + type + "='" + field + "']");
        if (!node.id) {
            var ncid = _cxt.nextDocumentId();
            node.id = ncid;
            rt[field] = { _id: ncid };
        }
    } else
        node = div;
    node.className = styles;
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, rt[field], node, templateName, field, option, source);
    }
}

FLCard.prototype._updateTemplate = function(_cxt, _renderTree, type, field, fn, templateName, value, _tc) {
    value = _cxt.full(value);
    var div = document.getElementById(_renderTree._id);
    const node = div.querySelector("[data-flas-" + type + "='" + field + "']");
    if (node != null) {
        var crt;
        if (!node.id) {
            var ncid = _cxt.nextDocumentId();
            node.id = ncid;
            crt = _renderTree[field] = { _id: ncid };
        } else
            crt = _renderTree[field];
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
                    this._addItem(_cxt, rt, node, null, t, fn, value[i], _tc);
                }
            } else {
                if (crt.single) { // updating
                    this._addItem(_cxt, crt.single, node, node.firstElementChild, t, fn, value, _tc);
                } else { // creating
                    var rt = crt.single = {};
                    this._addItem(_cxt, rt, node, null, t, fn, value, _tc);
                }
            }
        }
    }
}

FLCard.prototype._addItem = function(_cxt, rt, parent, currNode, template, fn, value, _tc) {
    if (!currNode) {
        var div = template.content.cloneNode(true);
        var ncid = _cxt.nextDocumentId();
        currNode = div.firstElementChild;
        currNode.id = ncid;
        rt._id = ncid;
        parent.appendChild(currNode);
    }
    fn.call(this, _cxt, rt, value, _tc);
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, rt, div, template.id, null, null, value);
    }
}

FLCard.prototype._updateContainer = function(_cxt, _renderTree, field, value, fn) {
    value = _cxt.full(value);
    var div = document.getElementById(_renderTree._id);
    const node = div.querySelector("[data-flas-container='" + field + "']");
    if (!node.id) {
        var ncid = _cxt.nextDocumentId();
        node.id = ncid;
        _renderTree[field] = { _id: ncid };
    }
    var crt = _renderTree[field];
    // TODO: this is the "perfect" case but this is not the *test* for the perfect case
    if (value && node.children.length == value.length) {
        for (var i=0;i<value.length;i++) {
        	fn.call(this, _cxt, _renderTree[field].children[i], node, node.children[i], value[i]);
        }
    } else {
		node.innerHTML = '';
		if (!value)
			return;
		_renderTree[field].children = [];
		for (var i=0;i<value.length;i++) {
			var e = value[i];
			var rt  = {};
			_renderTree[field].children.push(rt);
			fn.call(this, _cxt, rt, node, null, e);
		}
    }
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLCard;
else
	window.FLCard = FLCard;