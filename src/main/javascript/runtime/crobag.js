const FLObject = require("./object");
const { IdempotentHandler } = require('../../resources/ziwsh');
const { ResponseWithMessages } = require("./messages");
//--REQUIRE

/* Contracts */

// SlideWindow
SlideWindow = function(_cxt) {
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
CrobagWindow = function(_cxt) {
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


/* CROBAG itself */
const Crobag = function(_cxt, _card) {
    FLObject.call(this, _cxt);
    this._card = _card;
    // this.state = _cxt.fields();
    this._entries = [];
}

Crobag._ctor_new = function(_cxt, _card) {
    const ret = new Crobag(_cxt, _card);
    return new ResponseWithMessages(_cxt, ret, []);
}
Crobag._ctor_new.nfargs = function() { return 1; }

Crobag.prototype.add = function(_cxt, key, val) {
    return [CrobagChangeEvent.eval(_cxt, this, key, null, val)];
}
Crobag.prototype.add.nfargs = function() { return 1; }

Crobag.prototype.window = function(_cxt, from, size, handler) {
    return [CrobagWindowEvent.eval(_cxt, this, from, size, handler)];
}
Crobag.prototype.window.nfargs = function() { return 3; }

Crobag.prototype.size = function(_cxt) {
    return this._entries.length;
}
Crobag.prototype.size.nfargs = function() { return 0; }

// internal method called from CCE.dispatch()
Crobag.prototype._change = function(cx, add, remove, val) {
    if (add != null) {
        var e = new CroEntry(add, val);
        var done = false;
        for (var i=0;i<this._entries.length;i++) {
            if (this._entries[i].key > add) {
                this._entries.splice(i, 0, e);
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
        "add": Crobag.prototype.add,
        "size": Crobag.prototype.size,
        "window": Crobag.prototype.window
    };
}

// Events

const CrobagChangeEvent = function() {
}
CrobagChangeEvent.eval = function(_cxt, bag, add, remove, val) {
    const e = new CrobagChangeEvent();
    e.bag = bag;
    e.add = add;
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
    this.add = cx.full(this.add);
    if (this.add instanceof FLError)
        return this.add;
    this.remove = cx.full(this.remove);
    if (this.remove instanceof FLError)
        return this.remove;
    this.val = cx.full(this.val);
    if (this.val instanceof FLError)
        return this.val;
    this.bag._change(cx, this.add, this.remove, this.val);
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

_ActualSlideHandler = function(_cxt, crobag) {
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
  
//--EXPORTS
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
    module.exports = { Crobag };
} else {
    window.Crobag = Crobag;
}