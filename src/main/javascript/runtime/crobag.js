import FLObject from "./object.js";
import { IdempotentHandler } from '../../resources/ziwsh.js';
import { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } from './messages.js';

/* Contracts */

// SlideWindow
var SlideWindow = function(_cxt) {
    IdempotentHandler.call(this, _cxt);
    return ;
}
SlideWindow.prototype = new IdempotentHandler();
SlideWindow.prototype.constructor = SlideWindow;

SlideWindow.prototype.name = function() {
    return 'SlideWindow';
}

SlideWindow.prototype.name.nfargs = function() { return -1; }

SlideWindow.prototype._methods = function() {
    const v1 = ['success','failure'];
    return v1;
}

SlideWindow.prototype._methods.nfargs = function() { return -1; }

// CrobagWindow
var CrobagWindow = function(_cxt) {
    IdempotentHandler.call(this, _cxt);
    return ;
}
CrobagWindow.prototype = new IdempotentHandler();
CrobagWindow.prototype.constructor = CrobagWindow;

CrobagWindow.prototype.name = function() {
    return 'CrobagWindow';
}
CrobagWindow.prototype.name.nfargs = function() { return -1; }

CrobagWindow.prototype._methods = function() {
    const v1 = ['success','failure','next','done'];
    return v1;
}
CrobagWindow.prototype._methods.nfargs = function() { return -1; }

CrobagWindow.prototype.next = function(_cxt, _key, _value, _ih) {
    return 'interface method for CrobagWindow.next';
}
CrobagWindow.prototype.next.nfargs = function() { return 2; }
  
CrobagWindow.prototype.done = function(_cxt, _ih) {
    return 'interface method for CrobagWindow.done';
}
CrobagWindow.prototype.done.nfargs = function() { return 0; }
 

/* CROBAG entry */
const CroEntry = function(key, val) {
    this.key = key;
    this.val = val;
}

CroEntry.fromWire = function(cx, om, fields) {
    var lt = new ListTraverser(cx, om.state);
    om.marshal(lt, fields["value"]);
    return new CroEntry(fields["key"], lt.ret[0]);
}


/* CROBAG itself */
const Crobag = function(_cxt, _card) {
    FLObject.call(this, _cxt);
    this._card = _card;
    // a crobag doesn't have any actual fields, but ZiWSH wants to pretend it does
    this.state = { dict: {} }; // _cxt.fields();
    this._entries = [];
}

Crobag._ctor_new = function(_cxt, _card) {
    const ret = new Crobag(_cxt, _card);
    return new ResponseWithMessages(_cxt, ret, []);
}
Crobag._ctor_new.nfargs = function() { return 1; }

Crobag.fromWire = function(cx, om, fields) {
    var ret = new Crobag(cx, null);
    var os = fields["entries"];
    if (os.length > 0) {
        var lt = new ListTraverser(cx, om.state);
        for (var i=0;i<os.length;i++) {
            om.marshal(lt, os[i]);
        }
        ret._entries = lt.ret;
    }
    return ret;
}

Crobag.prototype._towire = function(wf) {
    wf._wireable = 'org.flasck.jvm.builtin.Crobag';
    var os = fields["entries"];
    if (os.length > 0) {
        var lt = new ListTraverser(cx, om.state);
        for (var i=0;i<os.length;i++) {
            om.marshal(lt, os[i]);
        }
        ret._entries = lt.ret;
    }
    return ret;
}

Crobag.prototype.insert = function(_cxt, key, val) {
    return [CrobagChangeEvent.eval(_cxt, this, "insert", key, null, val)];
}
Crobag.prototype.insert.nfargs = function() { return 1; }

Crobag.prototype.put = function(_cxt, key, val) {
    return [CrobagChangeEvent.eval(_cxt, this, "put", key, null, val)];
}
Crobag.prototype.put.nfargs = function() { return 1; }

Crobag.prototype.upsert = function(_cxt, key, val) {
    return [CrobagChangeEvent.eval(_cxt, this, "upsert", key, null, val)];
}
Crobag.prototype.upsert.nfargs = function() { return 1; }

Crobag.prototype.window = function(_cxt, from, size, handler) {
    return [CrobagWindowEvent.eval(_cxt, this, from, size, handler)];
}
Crobag.prototype.window.nfargs = function() { return 3; }

Crobag.prototype.size = function(_cxt) {
    return this._entries.length;
}
Crobag.prototype.size.nfargs = function() { return 0; }

// internal method called from CCE.dispatch()
Crobag.prototype._change = function(cx, op, newKey, remove, val) {
    if (newKey != null) {
        var e = new CroEntry(newKey, val);
        var done = false;
        for (var i=0;i<this._entries.length;i++) {
            if (this._entries[i].key > newKey) {
                this._entries.splice(i, 0, e);
                done = true;
                break;
            } else if (this._entries[i].key == newKey) {
                if (op == "insert") {
                    continue;
                } else if (op == "put") {
                    // just shove it in
                    this._entries.splice(i, 1, e);
                } else if (op == "upsert") {
                    // update this_.entries[i] with values from e
                }

                done = true;
                break;
            }
        }
        if (!done)
            this._entries.push(e);
    }
}

Crobag.prototype._methods = function() {
    return {
        "insert": Crobag.prototype.insert,
        "put": Crobag.prototype.put,
        "size": Crobag.prototype.size,
        "upsert": Crobag.prototype.upsert,
        "window": Crobag.prototype.window
    };
}

// Events

const CrobagChangeEvent = function() {
}
CrobagChangeEvent.eval = function(_cxt, bag, op, newKey, remove, val) {
    const e = new CrobagChangeEvent();
    e.bag = bag;
    e.op = op;
    e.newKey = newKey;
    e.remove = remove;
    e.val = val;
	return e;
}
CrobagChangeEvent.prototype._compare = function(cx, other) {
	if (other instanceof CrobagChangeEvent) {
		return other.msg == this.msg;
	} else
		return false;
}
CrobagChangeEvent.prototype.dispatch = function(cx) {
    this.bag = cx.full(this.bag);
    if (this.bag instanceof FLError)
        return this.bag;
    this.op = cx.full(this.op);
    if (this.op instanceof FLError)
        return this.op;
    this.newKey = cx.full(this.newKey);
    if (this.newKey instanceof FLError)
        return this.newKey;
    this.remove = cx.full(this.remove);
    if (this.remove instanceof FLError)
        return this.remove;
    this.val = cx.full(this.val);
    if (this.val instanceof FLError)
        return this.val;
    this.bag._change(cx, this.op, this.newKey, this.remove, this.val);
    return [];
}
CrobagChangeEvent.prototype.toString = function() {
	return "CrobagChangeEvent[" + this.from + ":" + this.size + "]";
}

// Note: strictly speaking, I am not sure this event is needed
// I think we could just return the list of "Send" events directly from window
const CrobagWindowEvent = function() {
}
CrobagWindowEvent.eval = function(_cxt, bag, from, size, replyto) {
    const e = new CrobagWindowEvent();
    e.bag = bag;
    e.from = from;
    e.size = size;
    e.replyto = replyto;
	return e;
}
CrobagWindowEvent.prototype._compare = function(cx, other) {
	if (other instanceof CrobagWindowEvent) {
		return other.msg == this.msg;
	} else
		return false;
}
CrobagWindowEvent.prototype.dispatch = function(cx) {
    this.bag = cx.full(this.bag);
    if (this.bag instanceof FLError)
        return this.bag;
    this.from = cx.full(this.from);
    if (this.from instanceof FLError)
        return this.from;
    this.size = cx.full(this.size);
    if (this.size instanceof FLError)
        return this.size;
    this.replyto = cx.full(this.replyto);
    if (this.replyto instanceof FLError)
        return this.replyto;
    var arr = [];
    var k = 0;
    for (var i=0;i<this.bag._entries.length;i++) {
        var e = this.bag._entries[i];
        if (e.key < this.from)
            continue;
        if (k >= this.size)
            break;
        arr.push(Send.eval(cx, this.replyto, "next", [e.key, e.val], null));
    }
    arr.push(Send.eval(cx, this.replyto, "done", [], _ActualSlideHandler.eval(cx, this.crobag)));
    return arr;
}
CrobagWindowEvent.prototype.toString = function() {
	return "CrobagWindowEvent[" + this.from + ":" + this.size + "]";
}

var _ActualSlideHandler = function(_cxt, crobag) {
    SlideWindow.call(this, _cxt);
    this.state = _cxt.fields();
    this._card = crobag;
    return;
}
_ActualSlideHandler.prototype = new SlideWindow();
_ActualSlideHandler.prototype.constructor = _ActualSlideHandler;

_ActualSlideHandler.eval = function(_cxt, crobag) {
    const v1 = new _ActualSlideHandler(_cxt, crobag);
    v1.state.set('_type', '_ActualSlideHandler');
    return v1;
}
_ActualSlideHandler.eval.nfargs = function() { return 1; }

_ActualSlideHandler.prototype._card = function() {
    return this._card;
}
_ActualSlideHandler.prototype._card.nfargs = function() { return -1; }
  
export { Crobag, CroEntry };