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

FLCard.prototype._currentRenderTree = function() {
    return this._renderTree;
}

FLCard.prototype._attachHandlers = function(_cxt, rt, div, key, field, option, source, evconds) {
    const evcs = this._eventHandlers()[key];
    if (evcs) {
        if (rt && rt.handlers) {
            for (var i=0;i<rt.handlers.length;i++) {
                var rh = rt.handlers[i];
                // _cxt.env.logger.log("removing event listener from " + div.id + " for " + rh.hi.event._eventName);
                div.removeEventListener(rh.hi.event._eventName, rh.eh);
            }
            delete rt.handlers;
        }
        for (var ej=0;ej<evcs.length;ej++) {
            var handlerInfo = evcs[ej];
            if (!handlerInfo.slot) {
                if (field)
                    continue;
            } else {
                if (field != handlerInfo.slot)
                    continue;
            }
            if (handlerInfo.option && handlerInfo.option != option)
                continue;
            if (evconds && typeof handlerInfo.cond !== 'undefined') {
                if (!evconds[handlerInfo.cond])
                    continue;
            }            
            var eh = _cxt.attachEventToCard(this, handlerInfo, div, { value: source });
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
    if (typeof value === 'undefined' || value == null)
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
        styles = _cxt.full(constant);
    var evconds = [];
    for (var i=0;i<rest.length;i+=2) {
        if (_cxt.isTruthy(rest[i])) {
            styles += ' ' + _cxt.full(rest[i+1]);
            evconds.push(true);
        } else {
            evconds.push(false);
        }
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
        this._attachHandlers(_cxt, rt[field], node, templateName, field, option, source, evconds);
    }
}

FLCard.prototype._updateTemplate = function(_cxt, _renderTree, type, field, fn, templateName, value, _tc) {
    value = _cxt.full(value);
    var div = document.getElementById(_renderTree._id);
    const node = div.querySelector("[data-flas-" + type + "='" + field + "']");
    if (node != null) {
        var crt;
        var create = false;
        if (!node.id) {
            var ncid = _cxt.nextDocumentId();
            node.id = ncid;
            crt = _renderTree[field] = { _id: ncid };
            create = true;
        } else
            crt = _renderTree[field];
        node.innerHTML = '';
        if (!value) // if undefined, we want nothing - even when we get around to updating, so make sure that still blanks it
            return;
        var t = document.getElementById(templateName);
        if (t != null) {
            if (Array.isArray(value)) {
                var chn;
                if (!crt.children) {
                    crt.children = [];
                }
                var card = this;
                this._updateList(node, crt.children, value, {
                    insert: function (rtc, ni, v) {
                        card._addItem(_cxt, rtc, node, ni, t, fn, v, _tc);
                    }
                });
            } else {
                if (crt.single) { // updating
                    this._addItem(_cxt, crt.single, node, node.firstElementChild, t, fn, value, _tc);
                } else { // creating
                    var rt = crt.single = {};
                    this._addItem(_cxt, rt, node, null, t, fn, value, _tc);
                }
            }
        } else {
            _cxt.log("there is no template " + templateName);
        }
    } else {
        _cxt.log("there is no '" + type + "' called '" + field + "' in " + _renderTree._id);
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
    var card = this;
    if (Array.isArray(value)) {
        this._updateList(node, crt.children, value, {
            insert: function(rtc, ni, v) {
                fn.call(card, _cxt, rtc, node, ni, v);
            }
        });
    } else if (value instanceof Crobag) {
        this._updateCrobag(node, crt.children, value, {
            insert: function(rtc, ni, v) {
                fn.call(card, _cxt, rtc, node, ni, v);
            }
        });
    } else {
        // a single element container
        var curr = null;
        if (!crt.single)
            crt.single = {};
        else if (value == crt.single.value) {
            curr = node.firstElementChild;
        } else { // clear it out
            node.innerHTML = '';
            crt.single = {};
        }
        fn.call(card, _cxt, crt.single, node, curr, value);
    }
}

FLCard.prototype._updateList = function(parent, rts, values, cb) {
    var sw = this._diffLists(rts, values);
    if (sw === true) {
        for (var i=0;i<values.length;i++) {
        	cb.insert(rts[i], parent.children[i], values[i]);
        }
    } else if (sw.op === 'addtoend') {
        // update the ones that were already there
        for (var i=0;i<rts.length;i++) {
        	cb.insert(rts[i], parent.children[i], values[i]);
        }
        for (var i=rts.length;i<values.length;i++) {
            var e = values[i];
            var rt  = {value: e};
            rts.push(rt);
            cb.insert(rt, null, e);
        }
    } else if (sw.op === 'add') {
        var done = [];
        for (var i=0;i<sw.additions.length;i++) {
            var ai = sw.additions[i];
            var e = ai.value;
            var rt  = {value: e};
            rts.splice(ai.where, 0, rt);
            cb.insert(rt, null, e);
            if (ai.where < parent.childElementCount-1)
                parent.insertBefore(parent.lastElementChild, parent.children[ai.where]);
            done.push(ai.where);
        }
        for (var i=0;i<values.length;i++) {
            if (!done.includes(i))
        	cb.insert(rts[i], parent.children[i], values[i]);
        }
    } else if (sw.op === 'removefromend') {
        rts.splice(values.length);
        while (values.length < parent.childElementCount) {
            parent.lastChild.remove();
        }
        // update the rest
        for (var i=0;i<values.length;i++) {
        	cb.insert(rts[i], parent.children[i], values[i]);
        }
    } else if (sw.op === 'remove') {
        for (var i=0;i<sw.removals.length;i++) {
            var ri = sw.removals[i];
            rts.splice(ri.where, 1);
            parent.children[ri.where].remove();
        }
        // update the rest
        for (var i=0;i<values.length;i++) {
        	cb.insert(rts[i], parent.children[i], values[i]);
        }
    } else if (sw.op === 'disaster') {
        // There are any number of sub-cases here but basically we have a "current" map of value index to field id
        // We detach everything we already have from the parent and save it by node id (and copy off the existing rtc array)
        // We then go through the values and either pull back and update or insert a new value, updating the rtc as we go
        var map = {};
        while (parent.firstElementChild) {
            var nd = parent.removeChild(parent.firstElementChild);
            var rtc = rts.shift();
            map[nd.id] = { nd, rtc };
        }
        console.log("disaster map", sw.mapping, map);
        for (var i=0;i<values.length;i++) {
            if (sw.mapping[i]) { // it was already there
                var tmp = map[sw.mapping[i]];
                parent.appendChild(tmp.nd);
                rts.push(tmp.rtc);
                delete map[sw.mapping[i]];
            } else { // add it
                var e = values[i];
                var rt  = {value: e};
                rts.push(rt);
                cb.insert(rt, null, e);
            }
        }
    } else {
        throw new Error("not handled: " + sw.op);
    }
}

FLCard.prototype._updateCrobag = function(parent, rts, crobag, callback) {
    for (var i=0;i<crobag.size();i++) {
        var e = crobag._entries[i];
        if (i >= rts.length) {
            // if we've reached the end, add at the end ...
            var rt  = {value: e};
            rts.push(rt);
            callback.insert(rt, null, e.val);
        } else if (e.key == rts[i].value.key) {
            // if it matches, update it
            callback.insert(rts[i], parent.children[i], e.val);
        } else if (e.key < rts[i].value.key) {
            // a new entry - insert it here
            var rt  = {value: e};
            rts.splice(i, 0, rt);
            callback.insert(rt, null, e.val);
            i++;
        } else if (e.key > rts[i].value.key) {
            // the current entry appears to no longer be in the crobag - remove it
            var rt = rts[i];
            rts.splice(i, 1);
            document.getElementById(rt._id).remove();
        } else {
            debugger;
        }
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
FLCard.prototype._diffLists = function(rtc, list) {
    var ret = { additions: [], removals: [], mapping: {} };
    var added = false, removed = false;
    var used = {};
    outer:
    for (var i=0,j=0;i<rtc.length && j<list.length;j++) {
        if (rtc[i].value == list[j]) {
            ret.mapping[j] = rtc[i]._id;
            used[i] = true;
            i++;
        } else {
            // try skipping forward through rtc; if you find it mark it "removed" (the rtc[i] has been removed)
            for (var k=i+1;k<rtc.length;k++) {
                if (list[j] === rtc[k].value) {
                    ret.mapping[j] = rtc[k]._id;
                    used[k] = true;
                    ret.removals.unshift({where: i});
                    i = k+1;
                    removed = true;
                    continue outer;
                }
            }
            // try skipping forward through list; if you find an existing one mark this value "added" (there is no current rtc[i] for it)
            for (var k=j+1;k<list.length;k++) {
                if (list[k] === rtc[i].value) {
                    ret.mapping[k] = rtc[i]._id;
                    ret.additions.unshift({where: i, value: list[j]});
                    added = true;
                    continue outer;
                }
            }
            // the list item has been added and the existing item has been removed
            // it's a disaster so try and find the value backwards if we can
            for (var k=i-1;k>=0;k--) {
                if (used[k])
                    continue;
                if (list[j] == rtc[k].value) {
                    // we found it going backwards
                    ret.mapping[j] = rtc[k]._id;
                    used[k] = true;
                    break;
                }
            }
            added = removed = true;
            i++;
        }
    }
    if ((added || j < list.length) && (removed || i < rtc.length)) {
        ret.op = "disaster";
        while (j < list.length) {
            for (var k=0;k<rtc.length;k++) {
                if (used[k])
                    continue;
                if (rtc[k].value == list[j]) {
                    ret.mapping[j] = rtc[k]._id;
                    used[k] = true;
                    break;
                }
            }
            j++;
        }
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