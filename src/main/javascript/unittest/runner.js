import { CommonEnv } from '../runtime/env.js';
import { UTContext } from './utcxt.js';
import { SimpleBroker, JsonBeachhead } from '../../resources/ziwsh.js';
import { MockAgent, MockCard, MockFLObject, MockAppl, MockAjaxService } from './mocks.js';
import { FLError } from '../runtime/error.js';
import { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } from '../runtime/messages.js';

const UTRunner = function(bridge) {
	if (!bridge)
		bridge = console; // at least get the logger ...
	CommonEnv.call(this, bridge, new SimpleBroker(bridge, this, {}));
	this.errors = [];
	this.mocks = {};
	this.ajaxen = [];
	this.appls = [];
	this.activeSubscribers = [];
	if (typeof(window) !== 'undefined')
		window.utrunner = this;
	this.moduleInstances = {};
	this.toCancel = new Map();
	for (var mn in UTRunner.modules) {
		if (UTRunner.modules.hasOwnProperty(mn)) {
			var jm;
			if (bridge.module) {
				jm = bridge.module(this, mn);
				if (jm == 'must-wait')
					continue;
			}
			this.moduleInstances[mn] = new UTRunner.modules[mn](this, jm);
		}
	}
}

UTRunner.prototype = new CommonEnv();
UTRunner.prototype.constructor = UTRunner;

UTRunner.prototype.newContext = function() {
	return new UTContext(this, this.broker);
}

UTRunner.modules = {};

UTRunner.prototype.bindModule = function(name, jm) {
	this.moduleInstances[name] = new UTRunner.modules[name](this, jm);
}

UTRunner.prototype.makeReady = function() {
	CommonEnv.prototype.makeReady.call(this);
    this.broker.register("Ajax", new MockAjaxService());
}

UTRunner.prototype.error = function(err) {
	this.errors.push(err);
}
UTRunner.prototype.handleMessages = function(_cxt, msg) {
	return CommonEnv.prototype.handleMessages.call(this, _cxt, msg);
}
UTRunner.prototype.assertSameValue = function(_cxt, e, a) {
	e = _cxt.full(e);
	if (e instanceof ResponseWithMessages)
		e = e.obj; // just throw the messages away
	a = _cxt.full(a);
	if (!_cxt.compare(e, a)) {
		if (a instanceof FLError)
			a = a.message;
		throw new Error("NSV\n  expected: " + e + "\n  actual:   " + a);
	}
}
UTRunner.prototype.assertIdentical = function(_cxt, e, a) {
	e = _cxt.full(e);
//	if (e instanceof ResponseWithMessages)
//		e = e.obj; // just throw the messages away
	a = _cxt.full(a);
	if (a !== e) {
		if (a instanceof FLError)
			a = a.message;
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
UTRunner.prototype.close = function(_cxt, dest) {
	dest = _cxt.full(dest);
	if (dest instanceof MockCard) {
		dest = dest.card;
	}
	dest._close(_cxt);
	// we don't have a lot of choice but to update all cards
	this.updateAllCards(_cxt);
}
UTRunner.prototype.invoke = function(_cxt, inv) {
	inv = _cxt.full(inv);
	if (inv instanceof Array && inv.length == 1) {
		inv = inv[0];
	}
	var tcx;
	if (inv instanceof Send)
		tcx = _cxt.bindTo(inv.obj);
	else
		tcx = _cxt.split();
	this.queueMessages(tcx, inv);
	this.dispatchMessages(tcx);
}
UTRunner.prototype.send = function(_cxt, target, contract, msg, inargs) {
	_cxt.log("doing send from runner to " + contract + ":" + msg);
	var reply;
	var args = [];
	for (var i=0;i<inargs.length;i++) {
		if (inargs[i] instanceof MockCard) {
			args.push(inargs[i].card);
		} else {
			args.push(inargs[i]);
		}
	}
	var tcx = _cxt.bindTo(target);
	if (target.sendTo) {
		reply = target.sendTo(tcx, contract, msg, args);
	} else {
		var withArgs = args.slice();
		withArgs.unshift(tcx);
		reply = target[msg].apply(target, withArgs);
	}
	reply = tcx.full(reply);
	this.queueMessages(tcx, reply);
	this.dispatchMessages(tcx);
	this.updateCard(tcx, target);
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
	if (obj instanceof MockFLObject || obj instanceof MockCard || obj instanceof MockAppl)
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
		div.dispatchEvent(event._makeJSEvent(_cxt, div));
		this.dispatchMessages(_cxt);
	}
}
UTRunner.prototype.input = function(_cxt, target, zone, text) {
	var sendTo = this.findMockFor(target);
	if (!sendTo)
		throw Error("there is no mock " + target);
	var receiver;
	if (sendTo instanceof MockCard)
		receiver = sendTo.card;
	else if (sendTo instanceof MockFLObject)
		receiver = sendTo; // presuming an object
	else
		throw Error("cannot send event to " + target);
	var div = this.findDiv(_cxt, receiver._currentRenderTree(), zone, 0);
	if (div) {
		text = _cxt.full(text);
		if (text instanceof Error) {
			_cxt.log(text);
			return;
		}
		if (!div.tagName == "INPUT" || !div.hasAttribute("type") || (div.getAttribute("type") != "text" && div.getAttribute("type") != "password")) {
			_cxt.log("can only set input text on input elements of type text or password");
			return;
		}
		div.setAttribute("value", text);
	}
}
UTRunner.prototype.findDiv = function(_cxt, rt, zone, pos) {
	if (!rt) {
		throw Error("MATCH\nThe card has not been rendered");
	}
	if (pos >= zone.length) {
		return document.getElementById(rt._id);
	}
	const first = zone[pos];
	if (first[0] == "item") {
		if (!rt.children || first[1] >= rt.children.length) {
			throw Error("MATCH\nMatcher failed on '" + this._nameOf(zone, zone.length) + "': There is no child " + first[1] + " of " + this._nameOf(zone, pos));
		}
		return this.findDiv(_cxt, rt.children[first[1]], zone, pos+1);
	} else {
		const inner = this._findSubThroughSingle(rt, first[1]);
		if (!inner) {
			throw Error("MATCH\nThere is no element " + first[1] + " in " + this._nameOf(zone, pos));
		}
		return this.findDiv(_cxt, inner, zone, pos+1);
	}
}
UTRunner.prototype._findSubThroughSingle = function(rt, name) {
	while (true) {
		var ret = rt[name];
		if (ret)
			return ret;
		rt = rt['single'];
		if (rt == null)
			return null;
	}
}
UTRunner.prototype._nameOf = function(zone, pos) {
	if (pos == 0)
		return "card";
	var ret = "";
	for (var i=0;i<pos;i++) {
		if (ret)
			ret += '.';
		ret += zone[i][1];
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
UTRunner.prototype.matchText = function(_cxt, target, zone, contains, fails, expected) {
	var matchOn = this.findMockFor(target);
	if (!matchOn)
		throw Error("there is no mock " + target);
	try {
		var div = this.getZoneDiv(_cxt, matchOn, zone);
	} catch (e) {
		if (fails)
			return; // we were expecting that ...
		else
			throw e;
	}
	var actual = div.innerText.trim();
	actual = actual.replace(/\n/g, ' ');
	actual = actual.replace(/ +/, ' ');
	actual = actual.trim();
	if (contains) {
		if (!actual.includes(expected))
			throw new Error("MATCH\n  expected to contain: " + expected + "\n  actual:   " + actual);
	} else {
		if (actual != expected)
			throw new Error("MATCH\n  expected: " + expected + "\n  actual:   " + actual);
	}
}
UTRunner.prototype.matchTitle = function(_cxt, target, zone, contains, expected) {
	var matchOn = this.findMockFor(target);
	if (!matchOn)
		throw Error("there is no mock " + target);
	if (!(matchOn instanceof MockAppl))
		throw Error("can only test title on Appl");
	var titles = document.head.getElementsByTagName("title");
	var actual = "";
	for (var i=0;i<titles.length;i++) {
		actual += titles[i].innerText.trim() + " ";
	}
	actual = actual.trim();
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
UTRunner.prototype.matchImageUri = function(_cxt, target, zone, expected) {
	var matchOn = this.findMockFor(target);
	if (!matchOn)
		throw Error("there is no mock " + target);
	var div = this.getZoneDiv(_cxt, matchOn, zone);
	if (div.tagName != "IMG")
		throw new Error("MATCH\n  expected: IMG\n  actual:   " + div.tagName);

	var abs = new URL(expected, window.location).toString()
	var actual = div.src;
	if (actual != abs)
		throw new Error("MATCH\n  expected: " + abs + "\n  actual:   " + actual);
}
UTRunner.prototype.matchHref = function(_cxt, target, zone, expected) {
	var matchOn = this.findMockFor(target);
	if (!matchOn)
		throw Error("there is no mock " + target);
	var div = this.getZoneDiv(_cxt, matchOn, zone);
	if (div.tagName != "A")
		throw new Error("MATCH\n  expected: A\n  actual:   " + div.tagName);

	var abs = expected;
	var actual = div.dataset.route.toString();
	if (actual != abs)
		throw new Error("MATCH\n  expected: " + abs + "\n  actual:   " + actual);
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
UTRunner.prototype.matchScroll = function(_cxt, target, zone, contains, expected) {
	var matchOn = this.findMockFor(target);
	if (!matchOn)
		throw Error("there is no mock " + target);
	var div = this.getZoneDiv(_cxt, matchOn, zone);
	var actual = div.scrollTop;
	if (actual != expected)
		throw new Error("MATCH\n  expected: " + expected + "\n  actual:   " + actual);
}
UTRunner.prototype.route = function(_cxt, app, route, storeCards) {
	app.route(_cxt, route, () => {
		app.bindCards(_cxt, storeCards);
	});
}
UTRunner.prototype.userlogin = function(_cxt, app, user) {
	app.userLoggedIn(_cxt, user);
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
UTRunner.prototype.expectCancel = function(handler) {
	var hn;
	if (handler instanceof NamedIdempotentHandler) {
		hn = handler._ihid;
	} else {
		throw new Error("not handled");
	}
	this.toCancel.set(hn, handler);
}
UTRunner.prototype.cancelBound = function(varName, handlerName) {
	if (!this.toCancel.has(handlerName)) {
		throw new Error("UECAN\n  cancelled " + varName + " but it was not expected");
	}
	this.toCancel.delete(handlerName);
}
UTRunner.prototype.assertSatisfied = function() {
	if (this.toCancel.size != 0) {
		throw new Error("EXPCAN\n  subscription " /* + this.toCancel[0]*/ + "was not cancelled");
	}
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
UTRunner.prototype.newAjax = function(cxt, baseUri) {
	var ma = new MockAjax(cxt, baseUri);
	this.ajaxen.push(ma);
	return ma;
}
UTRunner.prototype.newMockAppl = function(cxt, clz) {
	var ma = new MockAppl(cxt, clz);
	this.appls.push(ma);
	return ma;
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
UTRunner.prototype.module = function(mod) {
	var m = this.moduleInstances[mod];
	if (!m)
		throw new Error("There is no module " + mod);
	return m;
}
UTRunner.prototype.transport = function(tz) {
	// we have a transport to Ziniki
	this.zinBch = new JsonBeachhead(this, "fred", this.broker, tz);
	this.broker.beachhead(this.zinBch);
}
UTRunner.prototype.deliver = function(json) {
	// we have a response from Ziniki
	this.logger.log("have " + json + " ready for delivery");
	var cx = this.newContext();
	var msgs = this.zinBch.dispatch(cx, json, null);
	this.logger.log("have messages", msgs);
	this.queueMessages(cx, msgs);
}
UTRunner.prototype.addHistory = function(state, title, url) {
	// we could forward this to the bridge if we wanted to do something specific
}

UTRunner.prototype.runRemote = function(testClz, spec) {
	var cxt = this.newContext();
	var st = new testClz(this, cxt);
	var allSteps = [];
	if (spec.configure) {
		var steps = spec.configure.call(st, cxt);
		for (var j=0;j<steps.length;j++)
			allSteps.push(steps[j]);
	}
	if (spec.stages) {
		for (var i=0;i<spec.stages.length;i++) {
			var steps = spec.stages[i].call(st, cxt);
			for (var j=0;j<steps.length;j++)
				allSteps.push(steps[j]);
		}
	}
	if (spec.cleanup) {
		var steps = spec.cleanup.call(st, cxt);
		for (var j=0;j<steps.length;j++)
			allSteps.push(steps[j]);
	}
	var bridge = this.logger; // we have stored it as "logger" but it is actually the bridge to "Java-world"
	bridge.executeSync(this, st, cxt, allSteps);
}

const makeBridge = function(jsb, logger) {
	return {
		log: logger.log,
		debugmsg: logger.debugmsg,
		// sendJson: (j) => jsb.sendJson.call(jsb, j),
		// transport: (z) => jsb.transport.call(jsb, z),
		module: (r, m) => jsb.module.call(jsb, r, m),
		error: (e) => jsb.error.call(jsb, e),
		lock: () => jsb.lock.call(jsb),
		unlock: () => jsb.unlock.call(jsb),
		getTestCounter: () => jsb.getTestCounter.call(jsb)
	};
}

export { UTRunner, makeBridge };