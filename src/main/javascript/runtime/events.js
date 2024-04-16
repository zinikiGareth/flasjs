const FLEvent = function() {
}

const FLEventSourceTrait = function(elt, source) {
    this.elt = elt;
    this.source = source;
}

FLEvent.prototype._eventSource = function(cx, tih) {
    return this.EventSource.source;
}

FLEvent.prototype._methods = function() {
    return {
        _eventSource: FLEvent.prototype._eventSource
    };
}

const ClickEvent = function() {
}
ClickEvent.prototype = new FLEvent();
ClickEvent.prototype.constructor = ClickEvent;
ClickEvent._eventName = 'click';

ClickEvent.eval = function(cx) {
    return new ClickEvent();
}

ClickEvent.prototype._areYouA = function(cx, name) {
    return name == "ClickEvent" || name == "Event";
}

ClickEvent.prototype._makeJSEvent = function (_cxt, div) {
    const ev = new Event("click", { bubbles: true });
    return ev;
}

ClickEvent.prototype._field_source = function (_cxt, ev) {
    return this.EventSource.source;
}
ClickEvent.prototype._field_source.nfargs = function () {
    return 0;
}

const ScrollTo = function(st) {
    this.st = st;
}
ScrollTo.prototype = new FLEvent();
ScrollTo.prototype.constructor = ScrollTo;
ScrollTo._eventName = 'scrollTo';

ScrollTo.eval = function(cx, st) {
    return new ScrollTo(st);
}

ScrollTo.prototype._areYouA = function(cx, name) {
    return name == "ScrollTo" || name == "Event";
}

ScrollTo.prototype._makeJSEvent = function (_cxt, div) {
    div.scrollTop = this.st;
    const ev = new Event("scroll", { bubbles: true });
    return ev;
}

ScrollTo.prototype._field_source = function (_cxt, ev) {
    return this.EventSource.source;
}
ScrollTo.prototype._field_source.nfargs = function () {
    return 0;
}

export { FLEvent, FLEventSourceTrait, ClickEvent, ScrollTo };