const FLError = require('../runtime/error');
//--REQUIRE

const Application = function(_cxt) {
	this.cards = {};
}

Application.prototype.gotoRoute = function(_cxt, r) {
	var card = new this.mainCard(_cxt);

	var ctr = _cxt.findContractOnCard(card, "Lifecycle");
	if (ctr && ctr.load) {
		_cxt.env.queueMessages(_cxt, ctr.load(_cxt, "loaded"));
	}

	// the main card is always called "main"
	this.cards.main = card;
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = Application;
else
//--WINDOW
	window.Application = Application;