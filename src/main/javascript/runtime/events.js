
//--REQUIRE

const Event = function() {
}

const ClickEvent = function() {
}
ClickEvent.prototype = new Event();
ClickEvent.prototype.constructor = ClickEvent;

ClickEvent.eval = function(cx) {
    return new ClickEvent();
}

ClickEvent.prototype.areYouA = function(name) {
    return name == "ClickEvent" || name == "Event";
}

//--EXPORT
/* istanbul ignore else */
if (typeof(module) !== 'undefined')
	module.exports = { ClickEvent };
else {
	window.ClickEvent = ClickEvent;
}