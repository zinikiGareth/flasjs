const CommonEnv = require('../runtime/env');
const { SimpleBroker } = require('../../resources/ziwsh');
const { MockCard, MockFLObject } = require('./mocks');
//--REQUIRE

const UTRunner = function(logger) {
	if (!logger)
		logger = console.log;
	CommonEnv.call(this, logger, new SimpleBroker(logger, this, {}));
	this.errors = [];
	this.mocks = {};
}

UTRunner.prototype = new CommonEnv();
UTRunner.prototype.constructor = UTRunner;

UTRunner.prototype.error = function(err) {
	this.errors.push(err);
}
UTRunner.prototype.handleMessages = function(_cxt, msg) {
	if (this.errors.length != 0)
		throw this.errors[0];
	return CommonEnv.prototype.handleMessages.call(this, _cxt, msg);
}
UTRunner.prototype.assertSameValue = function(_cxt, e, a) {
	e = _cxt.full(e);
	a = _cxt.full(a);
	if (!_cxt.compare(e, a)) {
		throw new Error("NSV\n  expected: " + e + "\n  actual:   " + a);
	}
}
UTRunner.prototype.shove = function(_cxt, dest, slot, val) {
	dest = _cxt.full(dest);
	val = _cxt.full(val);
	if (dest instanceof MockCard) {
		dest = dest.card;
	}
	dest.state.set(slot, val);
	if (dest._updateDisplay)
		dest._updateDisplay(_cxt, dest._renderTree);
	else {
		// we don't have a lot of choice but to update all cards
		this.updateAllCards(_cxt);
	}
}
UTRunner.prototype.invoke = function(_cxt, inv) {
	inv = _cxt.full(inv);
	this.queueMessages(_cxt, inv);
	this.dispatchMessages(_cxt);
}
UTRunner.prototype.send = function(_cxt, target, contract, msg, args) {
	var reply = target.sendTo(_cxt, contract, msg, args);
	reply = _cxt.full(reply);
	this.queueMessages(_cxt, reply);
	this.dispatchMessages(_cxt);
	this.updateCard(_cxt, target);
}
UTRunner.prototype.render = function(_cxt, target, fn, template) {
	var sendTo = this.findMockFor(target);
	if (!sendTo)
		throw Error("there is no mock " + target);
	sendTo.rt = {};
	if (sendTo.div) {
		sendTo.div.innerHTML = '';
	} else {
		const newdiv = document.createElement("div");
		newdiv.setAttribute("id", _cxt.nextDocumentId());
		document.body.appendChild(newdiv);
		sendTo.div = newdiv;
		sendTo.rt._id = newdiv.id;
	}
	const mr = document.createElement("div");
	mr.setAttribute("data-flas-mock", "result");
	sendTo.div.appendChild(mr);
	sendTo.redraw = function(cx) {
		sendTo.obj._updateTemplate(cx, sendTo.rt, "mock", "result", fn, template, sendTo.obj, []);
	}
	sendTo.redraw(_cxt);
}
UTRunner.prototype.findMockFor = function(obj) {
	if (obj instanceof MockFLObject || obj instanceof MockCard)
		return obj;
	var ks = Object.keys(this.mocks);
	for (var i=0;i<ks.length;i++) {
		if (this.mocks[ks[i]].obj == obj)
			return this.mocks[ks[i]];
	}
	throw new Error("no mock for " + obj);
}
UTRunner.prototype.event = function(_cxt, target, zone, event) {
	var sendTo = this.findMockFor(target);
	if (!sendTo)
		throw Error("there is no mock " + target);
	var div = null;
	var receiver;
	if (sendTo instanceof MockCard)
		receiver = sendTo.card;
	else if (sendTo instanceof MockFLObject)
		receiver = sendTo; // presuming an object
	else
		throw Error("cannot send event to " + target);
	if (!zone || zone.length == 0) {
		div = receiver._currentDiv();
	} else 
		div = this.findDiv(_cxt, receiver._currentRenderTree(), zone, 0);
	if (div) {
		div.dispatchEvent(event._makeJSEvent(_cxt));
		this.dispatchMessages(_cxt);
	}
}
UTRunner.prototype.findDiv = function(_cxt, rt, zone, pos) {
	if (pos >= zone.length) {
		return document.getElementById(rt._id);
	}
	const first = zone[pos];
	if (first[0] == "item") {
		if (!rt.children || first[1] >= rt.children.length) {
			throw Error("MATCH\nThere is no child " + first[1] + " in " + this._nameOf(zone, pos));
		}
		return this.findDiv(_cxt, rt.children[first[1]], zone, pos+1);
	} else {
		if (!rt[first[1]]) {
			throw Error("MATCH\nThere is no element " + first[1] + " in " + this._nameOf(zone, pos));
		}
		return this.findDiv(_cxt, rt[first[1]], zone, pos+1);
	}
}
UTRunner.prototype._nameOf = function(zone, pos) {
	if (pos == 0)
		return "card";
	var ret = "";
	for (var i=0;i<pos;i++) {
		if (ret)
			ret += '.';
		ret += zone[pos][1];
	}
	return ret;
}
UTRunner.prototype.getZoneDiv = function(_cxt, target, zone) {
	if (!target || !target._currentRenderTree) {
		throw Error("MATCH\nThe card has no rendered content");
	}
	// will throw error if not found
	return this.findDiv(_cxt, target._currentRenderTree(), zone, 0);
}
UTRunner.prototype.matchText = function(_cxt, target, zone, contains, expected) {
	var matchOn = this.findMockFor(target);
	if (!matchOn)
		throw Error("there is no mock " + target);
	var div = this.getZoneDiv(_cxt, matchOn, zone);
	var actual = div.innerText.trim();
	actual = actual.replace(/\n/g, ' ');
	actual = actual.replace(/ +/, ' ');
	if (contains) {
		if (!actual.includes(expected))
			throw new Error("MATCH\n  expected to contain: " + expected + "\n  actual:   " + actual);
	} else {
		if (actual != expected)
			throw new Error("MATCH\n  expected: " + expected + "\n  actual:   " + actual);
	}
}
UTRunner.prototype.matchStyle = function(_cxt, target, zone, contains, expected) {
	var matchOn = this.findMockFor(target);
	if (!matchOn)
		throw Error("there is no mock " + target);
	var div = this.getZoneDiv(_cxt, matchOn, zone);
	var clzlist = div.getAttribute("class");
	if (!clzlist)
		clzlist = "";
	clzlist = clzlist.trim().split(" ").sort();
	var explist = expected.trim().split(" ").sort();
	var failed = false;
	for (var i=0;i<explist.length;i++) {
		var exp = explist[i];
		failed |= !clzlist.includes(exp);
	}
	if (!contains)
		failed |= clzlist.length != explist.length;
	if (failed) {
		if (contains)
			throw new Error("MATCH\n  expected to contain: " + explist.join(' ') + "\n  actual: " + clzlist.join(' '));
		else
			throw new Error("MATCH\n  expected: " + explist.join(' ') + "\n  actual:   " + clzlist.join(' '));
	}
}
UTRunner.prototype.updateCard = function(_cxt, card) {
	if (!(card instanceof MockCard))
		return;
	if (card.card._updateDisplay)
		card.card._updateDisplay(_cxt, card.card._renderTree);
}
UTRunner.prototype.checkAtEnd = function() {
	if (this.errors.length > 0)
		throw this.errors[0];
}
UTRunner.prototype.newdiv = function(cnt) {
	if (cnt != null) { // specifically null, because we want to check on 0
		if (cnt != this.nextDivId - this.divSince) {
			throw Error("NEWDIV\n  expected: " + cnt + "\n  actual:   " + (this.nextDivId - this.divSince));
		}
	}
	this.divSince = this.nextDivId;
}
UTRunner.prototype.mockAgent = function(_cxt, agent) {
	return new MockAgent(agent);
}
UTRunner.prototype.mockCard = function(_cxt, name, card) {
	var ret = new MockCard(_cxt, card);
	this.mocks[name] = ret;
	this.cards.push(ret);
	return ret;
}
UTRunner.prototype._updateDisplay = function(_cxt, rt) {
	this.updateAllCards(_cxt);
}
UTRunner.prototype.updateAllCards = function(_cxt) {
	for (var i=0;i<this.cards.length;i++) {
		var mo = this.cards[i];
		if (mo instanceof MockFLObject) {
			if (mo.redraw)
				mo.redraw(_cxt);
		} else {
			var c = mo.card;
			if (c._updateDisplay)
				c._updateDisplay(_cxt, c._renderTree);
		}
	}
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = UTRunner;
else
//--WINDOW
	window.UTRunner = UTRunner;