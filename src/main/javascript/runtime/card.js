import { FLError } from "./error.js";
import { Html } from "./html.js";
import { Link } from "./link.js";
import { Crobag } from "./crobag.js";
import { Image } from "./image.js";

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
            this._resizeDisplayElements(_cxt, this._renderTree);
        }
    }
    // attach the default handlers to the card
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, this._renderTree, div, "_", null, 1, this); // unbound ones
    }
}

FLCard.prototype._resizeDisplayElements = function(_cxt, _rt) {
    if (!_rt)
        return;
    var container = document.getElementById(_rt._id);
    var cw = container.clientWidth;
    var ch = container.clientHeight;
    var nodes = document.querySelectorAll("#" + _rt._id + " .flas-sizing");
    for (var i=0;i<nodes.length;i++) {
        var n = nodes[i];
        var cl = n.classList;
        for (var j=0;j<cl.length;j++) {
            var cle = cl[j];
            if (cle.startsWith("flas-sizing-")) {
                this._setSizeOf(_cxt, n, cw, ch, cle.replace("flas-sizing-", ""));
                break;
            }
        }
    }
}

FLCard.prototype._setSizeOf = function(_cxt, img, cw, ch, alg) {
    var parent = img.parentElement;
    if (alg.startsWith("target-center-")) {
        parent.style.position = "relative";
        var props = alg.replace("target-center-", "");
        var idx = props.indexOf("-");
        var xp = parseFloat(props.substring(0, idx));
        var yp = parseFloat(props.substring(idx+1));
        var vprat = cw/ch;
        var imgrat = img.width/img.height;
        if (isNaN(imgrat))
            return;
        if (vprat < imgrat) { // portrait
            // 1. Figure the desired height of the image to appear in the container and make that thing.height
            parent.style.height = ch + "px";
            img.style.height = ch + "px";
            parent.style.width = "auto";
            img.style.width = "auto";
            parent.style.top = "0px";

            // 2. Figure out the new left
            var newImgWid = ch * imgrat;
            var left = -(newImgWid*xp/100-cw/2);
            if (left + newImgWid < cw) {
                left = cw - newImgWid;
                if (left > 0)
                    left /= 2;
            }
            parent.style.left = left + "px";
        } else { // landscape
            // 1. Figure the desired width of the image to appear in the container and make that thing.width
            parent.style.width = cw + "px";
            img.style.width = cw + "px";
            parent.style.height = "auto";
            img.style.height = "auto";
            parent.style.left = "0px";

            // 2. Figure out the new top
            var newImgHt = cw / imgrat;
            var top = -(newImgHt*yp/100-ch/2)
            if (top + newImgHt < ch) {
                top = ch - newImgHt;
                if (top > 0)
                    top /= 2;
            }
            parent.style.top = top + "px";
        }
    } else if (alg.startsWith("min-aspect-")) {
        parent.style.position = "relative";
        var props = alg.replace("min-aspect-", "");
        var idx = props.indexOf("-");
        var idx2 = props.indexOf("-", idx+1);
        var idx3 = props.indexOf("-", idx2+1);
        var idx4 = props.indexOf("-", idx3+1);
        var xc = parseFloat(props.substring(0, idx)) * cw / 100;
        var yc = parseFloat(props.substring(idx+1, idx2)) * ch / 100;
        var pct = parseFloat(props.substring(idx2+1, idx3)) / 100;
        var xr = parseFloat(props.substring(idx3+1, idx4));
        var yr = parseFloat(props.substring(idx4+1));
        var xp = cw * pct;
        var yp = ch * pct;
        var mp = Math.min(xp, yp);
        xr = xr * mp;
        yr = yr * mp;
        img.style.width = xr + "px";
        img.style.height = yr + "px";
        img.style.left = (xc - xr/2) + "px";
        img.style.top = (yc - yr/2) + "px";
    } else if (alg.startsWith("promote-box-")) {
        parent.style.position = "relative";
        var props = alg.replace("promote-box-", "");
        var idx = props.indexOf("-");
        var idx2 = props.indexOf("-", idx+1);
        var ar = parseFloat(props.substring(0, idx));
        var sm, rotate = false;
        if (idx2 != -1) {
            sm = parseFloat(props.substring(idx+1, idx2)) / 100;
            rotate = props.substring(idx2+1) == "rotate";
        } else {
            sm = parseFloat(props.substring(idx+1)) / 100;
        }
        // figure the smaller dimension, including border
        var md = Math.min(cw/ar, ch);
        // thus figure the desired width and height, without border width
        var dw = md*ar * (1 - 2*sm), dh = md * (1 - 2*sm);
        img.style.width = dw + "px";
        img.style.height = dh + "px";
        if (sm > 0) {
            img.style.borderTopWidth = img.style.borderBottomWidth = (md * sm) + "px";
            img.style.borderLeftWidth = img.style.borderRightWidth = (md * ar * sm) + "px";
        }
    } else if (alg.startsWith("text-")) {
        var props = alg.replace("text-", "");
        var rs = parseFloat(props) / 100;
        var parent = img.parentElement;
        var ps = Math.min(parent.clientWidth, parent.clientHeight);
        var sz = rs * ps;
        parent.style.fontSize = sz + "px";
    } else {
        _cxt.log("do not know sizing algorithm " + alg);
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

FLCard.prototype._updateContent = function(_cxt, rt, templateName, field, option, source, value, fromField) {
    if (!rt)
        return;
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
        if (source)
            rt[field].source = source;
        else
            rt[field].source = this;
        rt[field].fromField = fromField;
    }
    if (value instanceof Html) {
        node.innerHTML = value.state.get('html');
    } else {
        node.innerHTML = '';
        node.appendChild(document.createTextNode(value));
    }
    if (this._eventHandlers) {
        this._attachHandlers(_cxt, rt[field], node, templateName, field, option, source);
    }
}

FLCard.prototype._updateImage = function(_cxt, rt, templateName, field, option, source, value, fromField) {
    if (!rt)
        return;
    // In general, everything should already be fully evaluated, but we do allow expressions in templates
    value = _cxt.full(value);
    // it should be an Image object
    if (typeof value === 'undefined' || value == null || !(value instanceof Image))
        value = '';
    else
        value = value.getUri();
    var div = document.getElementById(rt._id);
    const node = div.querySelector("[data-flas-image='" + field + "']");
    if (!node.id) {
        var ncid = _cxt.nextDocumentId();
        node.id = ncid;
        rt[field] = { _id: ncid };
        if (source)
            rt[field].source = source;
        else
            rt[field].source = this;
        rt[field].fromField = fromField;
    }
    node.src = value;
    var self = this;
    node.onload = function(ev) { self._imageLoaded(_cxt); };
}

FLCard.prototype._updateLink = function(_cxt, rt, templateName, field, option, source, value, fromField) {
    if (!rt)
        return;
    // In general, everything should already be fully evaluated, but we do allow expressions in templates
    value = _cxt.full(value);
    // it should be an Link object
    var linkRef;
    var linkTitle;
    if (typeof value === 'undefined' || value == null || !(value instanceof Link))
        linkRef = linkTitle = '';
    else {
        linkRef = value._field_uri(_cxt).uri;
        linkTitle = value._field_title(_cxt);
    }
    var div = document.getElementById(rt._id);
    const node = div.querySelector("[data-flas-link='" + field + "']");
    if (!node.id) {
        var ncid = _cxt.nextDocumentId();
        node.id = ncid;
        rt[field] = { _id: ncid };
        if (source)
            rt[field].source = source;
        else
            rt[field].source = this;
        rt[field].fromField = fromField;
    }
    var env = _cxt.env;
    node.onclick = ev => env.appl.relativeRoute(env.newContext(), linkRef);
    node.dataset.route = linkRef;
    node.innerText = linkTitle;
}

FLCard.prototype._imageLoaded = function(_cxt) {
    this._resizeDisplayElements(_cxt, this._renderTree);
}

FLCard.prototype._updateFromInputs = function() {
    if (this._renderTree)
        this._updateFromEachInput(this._renderTree);
}

FLCard.prototype._updateFromEachInput = function(rt) {
    if (rt.children) {
        for (var i=0;i<rt.children.length;i++) {
            this._updateFromEachInput(rt.children[i]);
        }
    }
    var props = Object.keys(rt);
    for (var i=0;i<props.length;i++) {
        if (props[i] == "_id")
            continue;
        var sub = rt[props[i]];
        if (!sub._id)
            continue;
        var div = document.getElementById(sub._id);
        if (div.tagName == "INPUT" && div.hasAttribute("type") && (div.getAttribute("type") == "text" || div.getAttribute("type") == "password")) {
            if (sub.fromField) {
                sub.source.state.set(sub.fromField, div.value);
            }
        }
    }
}

FLCard.prototype._updateStyle = function(_cxt, rt, templateName, type, field, option, source, constant, ...rest) {
    if (!rt)
        return;
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
    if (!_renderTree)
        return;
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
                if (!crt.children) {
                    crt.children = [];
                }
                var card = this;
                this._updateList(_cxt, node, crt.children, value, {
                    insert: function (rtc, ni, v) {
                        card._addItem(_cxt, rtc, node, ni, t, fn, v, _tc);
                    }
                });
            } else if (value instanceof Crobag) {
                if (!crt.children) {
                    crt.children = [];
                }
                var card = this;
                this._updateCrobag(node, crt.children, value, {
                    insert: function(rtc, ni, v) {
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
    try {
        fn.call(this, _cxt, rt, value, _tc);
        if (this._eventHandlers) {
            this._attachHandlers(_cxt, rt, div, template.id, null, null, value);
        }
    } catch (e) {
        _cxt.log("cannot add item: ", value, e);
    }
}

FLCard.prototype._updateContainer = function(_cxt, _renderTree, field, value, fn) {
    if (!_renderTree)
        return;
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
        this._updateList(_cxt, node, crt.children, value, {
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

FLCard.prototype._updatePunnet = function(_cxt, _renderTree, field, value, fn) {
    if (!_renderTree)
        return;
    value = _cxt.full(value);
    if (value instanceof FLCard && value._destroyed) {
        value = null; // it should have been destroyed and removed already
    }
    var div = document.getElementById(_renderTree._id);
    const node = div.querySelector("[data-flas-punnet='" + field + "']");
    if (!node.id) {
        var ncid = _cxt.nextDocumentId();
        node.id = ncid;
        _renderTree[field] = { _id: ncid, children: [] };
    }
    var crt = _renderTree[field];
    if (value instanceof FLError) {
        _cxt.log("error cannot be rendered", value);
        value = null;
    }
    if (!value) {
        node.innerHTML = ''; // clear it out
        crt.children = [];
        return;
    } else if (value instanceof FLCard) {
        if (crt.children.length == 1 && crt.children[0].value == value)
            return;
        // clear out all extant children that are not "value"
        for (var i=0;i<crt.children.length;i++) {
            crt.children[i].value._renderTree = null;
        }
        crt.children = [];
        node.innerHTML = '';

        // create a new nested element
        var inid = _cxt.nextDocumentId();
        crt.children.push({ value });
        const pe = document.createElement("div");
        pe.setAttribute("id", inid);
        node.appendChild(pe);
        value._renderInto(_cxt, pe);
    } else if (Array.isArray(value)) {
        for (var i=0;i<value.length;i++) {
            if (value[i]._destroyed) {
                value.splice(i, 1);
                --i;
            }
        }
        var sw = this._diffLists(_cxt, crt.children, value);
        if (sw === true) {
            // everything matched
            for (var i=0;i<value.length;i++) {
                value[i]._updateDisplay(_cxt, value[i]._renderTree);
            }
        } else if (sw.op === 'addtoend') {
            for (var i=crt.children.length;i<value.length;i++) {
                if (value[i] instanceof FLCard) {
                    var inid = _cxt.nextDocumentId();
                    crt.children.push({ value: value[i] });
                    const pe = document.createElement("div");
                    pe.setAttribute("id", inid);
                    node.appendChild(pe);
                    value[i]._renderInto(_cxt, pe);
                } else {
                    throw new Error("not a card: " + value);
                }
            }
        } else if (sw.op === 'add') {
            for (var i=0;i<sw.additions.length;i++) {
                var ai = sw.additions[i];
                var e = ai.value;
                var rt  = {value: e};
                crt.children.splice(ai.where, 0, rt);
                if (e instanceof FLCard) {
                    var inid = _cxt.nextDocumentId();
                    const pe = document.createElement("div");
                    pe.setAttribute("id", inid);
                    node.appendChild(pe);
                    e._renderInto(_cxt, pe);
                } else {
                    throw new Error("not a card: " + value);
                }
                if (ai.where < node.childElementCount-1)
                    node.insertBefore(node.lastElementChild, node.children[ai.where]);
            }
        } else if (sw.op === 'removefromend') {
            for (var i=value.length;i<crt.children.length;i++) {
                var child = crt.children[i];
                node.removeChild(child.value._containedIn);
            }
            crt.children.splice(value.length);
        } else if (sw.op === 'disaster') {
            var rts  = crt.children;
            debugger;
        } else {
            throw new Error("cannot handle punnet change: " + sw.op);
        }
    } else
        throw new Error("what is this? " + value);
}

FLCard.prototype._updateList = function(cx, parent, rts, values, cb) {
    var sw = this._diffLists(cx, rts, values);
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
    var scrollInfo = this._figureScrollInfo(parent);
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
            parent.insertBefore(parent.lastElementChild, parent.children[i]);
        } else if (e.key > rts[i].value.key) {
            // the current entry appears to no longer be in the crobag - remove it
            var rt = rts[i];
            rts.splice(i, 1);
            document.getElementById(rt._id).remove();
        } else {
            debugger;
        }
    }
    switch (scrollInfo.lockMode) {
    case "bottom": {
        scrollInfo.scroller.scrollTop = scrollInfo.scroller.scrollHeight - scrollInfo.lockOffset;
        break;
    }
    case "top": {
        scrollInfo.scroller.scrollTop = parent.children[0].offsetTop + scrollInfo.lockOffset;
        break;
    }
    case "mid": {
        scrollInfo.scroller.scrollTop = scrollInfo.lockDiv.offsetTop - scrollInfo.lockOffset;
        break;
    }
    }
}

FLCard.prototype._figureScrollInfo = function(parent) {
    var div = parent;
    while (div != document.body) {
        var oy = window.getComputedStyle(div)['overflowY'];
        if (oy == 'scroll' || oy == 'auto')
            break;
        div = div.parentElement;
    }
    var min = div.scrollTop;
    var max = min + div.clientHeight;
    var mid = (min + max) / 2;
    var ret = { lockMode: 'bottom', lockOffset: 0, scroller: div, ht : 0, scrollht: div.scrollHeight, scrollTop: div.scrollTop, viewport: div.clientHeight };
    var nodes = parent.children;
    if (nodes.length == 0) {
        return ret;
    }

    var top = nodes[0];
    var bottom = nodes[nodes.length-1];
    
    // see if it's at the bottom
    if (bottom.offsetTop < max) {
        ret.lockMode = 'bottom';
        ret.lockOffset = ret.scrollht - ret.scrollTop;
    } else if (top.offsetTop + top.offsetHeight > min) {
        ret.lockMode = 'top';
        ret.lockOffset = ret.scrollTop - top.offsetTop;
    } else  {
        for (var i=0;i<nodes.length;i++) {
            if (nodes[i].offsetTop + nodes[i].offsetHeight >= mid) {
                ret.lockMode = 'mid';
                ret.lockDiv = nodes[i];
                ret.lockOffset = nodes[i].offsetTop - ret.scrollTop;
                break;
            }
        }
    }
    return ret;
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
FLCard.prototype._diffLists = function(_cxt, rtc, list) {
    var ret = { additions: [], removals: [], mapping: {} };
    var added = false, removed = false;
    var used = {};
    outer:
    for (var i=0,j=0;i<rtc.length && j<list.length;j++) {
        if (_cxt.compare(rtc[i].value, list[j])) {
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

FLCard.prototype._close = function(cx) {
    cx.log("closing card", this.name());
	this._destroyed = true;
    cx.unsubscribeAll(this);
}

export { FLCard };
