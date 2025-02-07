import { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } from '../messages.js';
import { Route } from './route.js';
import { RouteEvent } from './routeevent.js';
import { RoutingEntry } from './routingentry.js';

const Application = function(_cxt, topdiv, baseuri) {
	if (!_cxt)
		return;
	this._env = _cxt.env;
	if (typeof(topdiv) == 'string')
		this.topdiv = document.getElementById(topdiv);
	else
		this.topdiv = topdiv;
	this.baseuri = baseuri;
	this.cards = {};
	this.params = {};
	this.currentRoute = null; // TODO: this will need to be a URI, set at the end of gotoRoute

	this.addResizeListener(_cxt.env);
}

Application.prototype.addResizeListener = function(env) {
	if (typeof(window) === 'undefined')
		return;

	var appl = this;
	window.addEventListener('resize', function(ev) {
		var keys = Object.keys(appl.cards);
		for (var i=0;i<keys.length;i++) {
			var card = appl.cards[keys[i]];
			card._resizeDisplayElements(env.newContext(), card._renderTree);
		}
	});
}

Application.prototype.baseUri = function(_cxt) {
	return this.baseuri; // could be something like 'https://foo.com/app'
}

Application.prototype.gotoRoute = function(_cxt, route, allDone) {
	_cxt.log("going to route", route, "from", this.currentRoute);
	var goto = Route.parse(this.baseUri(), new RoutingEntry(this._routing()), route);
	var curr = null;
	if (this.currentRoute) {
		curr = Route.parse(this.baseUri(), new RoutingEntry(this._routing()), this.currentRoute);
	}
	var moveTo = goto.movingFrom(curr);
	_cxt.log("move to is", moveTo);
	var event = new RouteEvent(moveTo, this, null, null, allDone);
	_cxt.env.queueMessages(_cxt, event);
}

Application.prototype.handleSecurity = function(_cxt, ev) {
	if (!this.securityModule.requireLogin(_cxt, this, this.topdiv)) {
		this.routingPendingSecure = ev;
	} else {
		_cxt.env.queueMessages(ev);
	}
}

Application.prototype.nowLoggedIn = function(_cxt) {
	if (this.routingPendingSecure instanceof RouteEvent)
		_cxt.env.queueMessages(_cxt, this.routingPendingSecure);
	this.routingPendingSecure = null;
}

Application.prototype.parseRoute = function(_cxt, r) {
	var buri;
	if (typeof(baseUri) !== 'undefined' && baseUri)
		buri = baseUri;
	else
		buri = this.baseUri();
	if (r instanceof Location || r instanceof URL) {
		if (!buri) {
			// we don't have a base, so they *must* use the fragment
			r = r.hash;
		} else
			r = r.href;
	}
	if (buri) {
		if (r.startsWith("/"))
			r = buri + r;
		if (!r.endsWith("/"))
			r = r + "/";
		try {
			if (this.currentPath)
				r = new URL(r, this.currentPath).href;
			else 
				r = new URL(r, this.baseUri()).href;
		} catch (e) {}
		this.currentPath = r;
	}
	var url = r.replace(buri, '').replace(/^[#/]*/, '');
	var parts = url.split("/").filter(x => !!x);
	return parts;
}

Application.prototype.setTitle = function(_cxt, title) {
	if (title != null)
		this.title = title;
}

Application.prototype.complete = function(_cxt, route) {
	this.currentRoute = route;
	_cxt.env.queueMessages(_cxt, new UpdateDisplay(_cxt, this));
	_cxt.addHistory({}, this.title, this.currentRoute);
}

Application.prototype.bindParam = function(_cxt, param, value) {
	this.params[param] = value;
}

Application.prototype.createCard = function(_cxt, ci) {
	var card = this.cards[ci.name] = new ci.card(_cxt);
	var ctr = _cxt.findContractOnCard(card, "Lifecycle");
	if (ctr && ctr.init) {
		var msgs = ctr.init(_cxt);
		_cxt.env.queueMessages(_cxt, msgs);
	}
}

Application.prototype.destroyCard = function(_cxt, ci) {
	var card = this.cards[ci.name];
	card.destroyed = true;
	card._updateDisplay(_cxt, card._renderTree);
}

Application.prototype.readyCard = function(_cxt, name) {
	var card = this.cards[name];
	var ctr = _cxt.findContractOnCard(card, "Lifecycle");
	if (ctr && ctr.ready) {
		var msgs = ctr.ready(_cxt);
		_cxt.env.queueMessages(_cxt, msgs);
	}
}

Application.prototype.oneAction = function(_cxt, act, arg) {
	var card = this.cards[act.card];
	var ctr = _cxt.findContractOnCard(card, act.contract);
	if (ctr) {
		var m = act.action;
		if (ctr[m]) {
			var callWith = [ _cxt ];
			for (var ai=0;ai<act.args.length;ai++) {
				var aa = act.args[ai];
				if (aa.str) {
					callWith.push(aa.str);
				} else if (aa.ref) {
					callWith.push(this.cards[aa.ref]);
				} else if (aa.param) {
					callWith.push(this.params[aa.param]);
				} else if (aa.expr) {
					callWith.push(this[aa.expr].call(this, _cxt));
				} else
					throw new Error("huh? " + JSON.stringify(aa));
			}
			if (typeof(arg) !== 'undefined') {
				callWith.push(arg);
			}
			var msgs = ctr[m].apply(ctr, callWith);
			_cxt.env.queueMessages(_cxt, msgs);
		}
	}
}

Application.prototype._currentRenderTree = function() {
	var card = this.cards['main'];
	if (card == null)
		return null;
	return card._currentRenderTree();
}

Application.prototype._updateDisplay = function(_cxt, rt) {
	_cxt.log("updating display");
	if (this.title) {
		var titles = document.head.getElementsByTagName("title");
		if (titles.length == 0) {
			var t = document.createElement("title");
			document.head.appendChild(t);
			titles = [t];
		}
		titles[0].innerText = this.title;
	}
	var card = this.cards['main'];
	if (card == null)
		return;
	if (card._renderTree == null) {
		this.cards['main']._renderInto(_cxt, this.topdiv);
	}
	card._updateDisplay(_cxt, card._renderTree);
}

export { Application };
