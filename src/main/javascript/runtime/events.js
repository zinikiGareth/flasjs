
//--REQUIRE

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

ClickEvent.prototype._makeJSEvent = function (_cxt) {
    const ev = new Event("click", { bubbles: true });
    return ev;
}

ClickEvent.prototype._field_source = function (_cxt, ev) {
    return this.EventSource.source;
}
ClickEvent.prototype._field_source.nfargs = function () {
    return 0;
}

//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined')
	module.exports = { FLEvent, FLEventSourceTrait, ClickEvent };
else {
	window.FLEvent = FLEvent;
	window.FLEventSourceTrait = FLEventSourceTrait;
	window.ClickEvent = ClickEvent;
}