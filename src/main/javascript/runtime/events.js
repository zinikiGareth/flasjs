
//--REQUIRE

const FLEvent = function() {
}

const FLEventSourceTrait = function(elt, source) {
    this.elt = elt;
    this.source = source;
}

const ClickEvent = function() {
}
ClickEvent.prototype = new FLEvent();
ClickEvent.prototype.constructor = ClickEvent;
ClickEvent._eventName = 'click';

ClickEvent.eval = function(cx) {
    return new ClickEvent();
}

ClickEvent.prototype._areYouA = function(name) {
    return name == "ClickEvent" || name == "Event";
}

ClickEvent.prototype._makeJSEvent = function (_cxt) {
    const ev = new Event("click");
    return ev;
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