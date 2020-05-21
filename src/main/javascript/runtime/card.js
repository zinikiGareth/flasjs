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
                var create = false;
                var chn;
                if (!crt.children) {
                    chn = crt.children = [];
                    create = true;
                } else {
                    chn = crt.children;
                    elts = node.children;
                }
                for (var i=0;i<value.length;i++) {
                    var rt;
                    var curr;
                    if (create) {
                        rt  = {};
                        chn.push(rt);
                        curr = null;
                    } else {
                        rt = chn[i];
                        curr = elts[i];
                    }
                    this._addItem(_cxt, rt, node, curr, t, fn, value[i], _tc);
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
        _renderTree[field] = { _id: ncid, children: [] };
    }
    var crt = _renderTree[field];
    if (!value) {
        node.innerHTML = ''; // clear it out
        crt.children = [];
        return;
    }
    var sw = this.diffLists(crt.children, value);
    if (sw === true) {
        for (var i=0;i<value.length;i++) {
            crt.children[i].value = value[i];
        	fn.call(this, _cxt, crt.children[i], node, node.children[i], value[i]);
        }
    } else if (sw.op === 'addtoend') {
        for (var i=crt.children.length;i<value.length;i++) {
            var e = value[i];
            var rt  = {value: e};
            crt.children.push(rt);
            fn.call(this, _cxt, rt, node, null, e);
        }
    } else if (sw.op === 'add') {
        for (var i=0;i<sw.additions.length;i++) {
            var ai = sw.additions[i];
            var e = ai.value;
            var rt  = {value: e};
            crt.children.push(rt);
            fn.call(this, _cxt, rt, node, null, e);
            if (ai.where < node.childElementCount-1)
                node.insertBefore(node.lastElementChild, node.children[ai.where]);
        }
    } else if (sw.op === 'removefromend') {
        crt.children.splice(value.length);
        while (value.length < node.childElementCount) {
            node.lastChild.remove();
        }
    } else if (sw.op === 'remove') {
        for (var i=0;i<sw.removals.length;i++) {
            var ri = sw.removals[i];
            crt.children.splice(ri.where, 1);
            node.children[ri.where].remove();
        }
    } else {
        throw new Error("not handled: " + sw.op);
    }
}

/** This is provided with a list of RenderTree child and a new list of values.
 * We are not given any guarantees about either, but we need to figure out what, if anything has changed.
 * If nothing has changed (at the top level) return true;
 * otherwise, return a hash that contains:
 *  op - the broad-brush action to perform
 *    addtoend - there are new entries to add to the end
 *    add - there are new entries but they may go anywhere (see additions)
 *    removefromend - the final few elements need to be removed
 *    remove - remove the specified entries
 *    disaster - it's a complete disaster but some nodes are recoverable: remove everything but be ready to paste them back
 * additions - for add, a list of position and value for new values in reverse order for easy insertion
 */
FLCard.prototype.diffLists = function(rtc, list) {
    var ret = { additions: [], removals: [] };
    var added = false, removed = false;
    outer:
    for (var i=0,j=0;i<rtc.length && j<list.length;) {
        if (rtc[i].value == list[j]) {
            i++, j++
        } else {
            // try skipping forward through rtc; if you find it mark it "removed" (the rtc[i] has been removed)
            for (var k=i+1;k<rtc.length;k++) {
                if (list[j] == rtc[k].value) {
                    ret.removals.unshift({where: i});
                    i = k+1;
                    j++;
                    removed = true;
                    continue outer;
                }
            }
            // try skipping forward through list; if you find an existing one mark this value "added" (there is no current rtc[i] for it)
            for (var k=j+1;k<list.length;k++) {
                if (list[k] == rtc[i].value) {
                    ret.additions.unshift({where: i, value: list[j]});
                    j = k+1;
                    i++;
                    added = true;
                    continue outer;
                }
            }
            // the list item has been added and the existing item has been removed
            added = removed = true;
            i++, j++;
        }
    }
    if ((added || list.length > rtc.length) && (removed || list.length < rtc.length)) {
        ret.op = "disaster";
    } else if (added) {
        ret.op = "add";
        while (j < list.length) {
            ret.additions.unshift({ where: i++, value: list[j++] });
        }
    } else if (removed) {
        ret.op = "remove";
        while (i < rtc.length) {
            ret.removals.unshift({ where: i++ });
        }
    } else if (list.length > rtc.length) {
        ret.op = "addtoend";
    } else if (list.length < rtc.length) {
        ret.op = "removefromend";
    } else
        return true; // nothing appears to have changed
    return ret;
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLCard;
else
	window.FLCard = FLCard;