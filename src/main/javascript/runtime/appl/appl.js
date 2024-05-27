import { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } from '../messages.js';
import { Route } from './route.js';
import { RouteEvent } from './routeevent.js';
import { RoutingEntry } from './routingentry.js';

const Application = function(_cxt, topdiv, baseuri) {
	if (typeof(topdiv) == 'string')
		this.topdiv = document.getElementById(topdiv);
	else
		this.topdiv = topdiv;
	this.baseuri = baseuri;
	this.cards = {};
	this.params = {};
	this.currentRoute = null; // TODO: this will need to be a URI, set at the end of gotoRoute
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
	var event = new RouteEvent(moveTo, this, null, allDone);
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

Application.prototype.OLDgotoRoute = function(_cxt, r, allDone) {
	var routing = this._routing();
	if (routing.secure) {
		if (!this.securityModule.requireLogin(_cxt, this, this.topdiv)) {
			this.routingPendingSecure = { routing, route: r };
			if (allDone)
				allDone();
			return;
		} else {
			this.routingPendingSecure = null;
		}
	}
	var ev = null;
	if (this.currentRoute == null) {
		ev = new EnterEvent(this, this.topdiv);
		this.currentRoute = [{ routes: routing }];
		this._createCards(_cxt, ev, routing.cards);
		this._routeActions(_cxt, ev, routing.enter);
		this._routeActions(_cxt, ev, routing.at);
		this._readyCards(_cxt, ev, routing.cards);
	}
	var path = this.parseRoute(_cxt, r);
	var cmn = this.removeCommon(_cxt, path);
	var at;
	if (this.currentRoute.length > cmn+1) {
		at = new MoveUpEvent(this, cmn, path);
	} else {
		at = new MoveDownEvent(this, this.currentRoute[cmn].routes, path, allDone);
	}
	if (ev) {
		ev.andThen(at);
		_cxt.env.queueMessages(_cxt, ev);
	} else {
		_cxt.env.queueMessages(_cxt, at);
	}
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

Application.prototype.removeCommon = function(_cxt, path) {
	var cmn = 0;
	while (path.length > 0 && cmn+1 < this.currentRoute.length && path[cmn] == this.currentRoute[cmn+1].routes.path) {
		path.shift();
		cmn++;
	}
	return cmn;
}

Application.prototype.moveUp = function(_cxt) {
	var exiting = this.currentRoute.pop().routes;
	var ev = new EnterEvent(this, null);
	this._routeActions(_cxt, ev, exiting.exit);
	this._closeCards(_cxt, ev, exiting.cards);
	this._routeActions(_cxt, ev, this.currentRoute[this.currentRoute.length-1].routes.at);
	_cxt.env.queueMessages(_cxt, ev);
	_cxt.env.queueMessages(_cxt, new UpdateDisplay(_cxt, this));
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

Application.prototype.moveDown = function(_cxt, table, path, allDone) {
	if (table.title != null)
		this.title = table.title;
	if (path.length == 0) {
		_cxt.env.queueMessages(_cxt, new UpdateDisplay(_cxt, this));
		if (allDone)
			allDone();
		_cxt.addHistory({}, this.title, this.currentPath);
		return;
	}

	var first = path[0];
	for (var i=0;i<table.routes.length;i++) {
		var rr = table.routes[i];
		if (rr.path == first || rr.param) {
			if (rr.secure) {
				// TODO: create nested cards that demand security
				// then process "enter" actions so that they are nested
				// then remember where we are trying to get and return
				throw new Error("cannot handle nested secure cards yet");
			}
			if (rr.param) {
				this.params[rr.param] = first;
			}
			this.currentRoute.push({ routes: rr });
			var ev = new EnterEvent(this, null);
			this._createCards(_cxt, ev, rr.cards);
			this._routeActions(_cxt, ev, rr.enter);
			this._routeActions(_cxt, ev, rr.at);
			this._readyCards(_cxt, ev, rr.cards);
	
			path.shift();
			ev.andThen(new MoveDownEvent(this, rr, path, allDone));
			_cxt.env.queueMessages(_cxt, ev);

			break;
		}
	}
}

Application.prototype._createCards = function(_cxt, ev, cards) {
	for (var i=0;i<cards.length;i++) {
		ev.add(createOne(this, cards[i]));
	}
}

Application.prototype._closeCards = function(_cxt, ev, cards) {
	for (var i=0;i<cards.length;i++) {
		ev.add(closeOne(this, cards[i]));
	}
}

Application.prototype.createCard = function(_cxt, ci) {
	var card = this.cards[ci.name] = new ci.card(_cxt);
	var ctr = _cxt.findContractOnCard(card, "Lifecycle");
	if (ctr && ctr.init) {
		var msgs = ctr.init(_cxt);
		_cxt.env.queueMessages(_cxt, msgs);
	}
}

Application.prototype.closeCard = function(_cxt, ci) {
	var card = this.cards[ci.name];
	var ctr = _cxt.findContractOnCard(card, "Lifecycle");
	if (ctr && ctr.closing) {
		var msgs = ctr.closing(_cxt);
		_cxt.env.queueMessages(_cxt, msgs);
	}
	// TODO: I think we need an explicit on-card "cleanup" method which closes subscriptions and
	// removes this card from any parents
	// reset of render tree should probably be in there ...
	if (card._renderTree) {
		var div = document.getElementById(card._renderTree._id);
		div.innerHTML = '';
		card._renderTree = null;
	}
}

function createOne(appl, ci) {
	return (_cxt) => {
		var card = appl.cards[ci.name] = new ci.card(_cxt);
		var ctr = _cxt.findContractOnCard(card, "Lifecycle");
		if (ctr && ctr.init) {
			var msgs = ctr.init(_cxt);
			_cxt.env.queueMessages(_cxt, msgs);
		}
	};
}

function closeOne(appl, ci) {
	return (_cxt) => {
		var card = appl.cards[ci.name];
		var ctr = _cxt.findContractOnCard(card, "Lifecycle");
		if (ctr && ctr.closing) {
			var msgs = ctr.closing(_cxt);
			_cxt.env.queueMessages(_cxt, msgs);
		}
		// TODO: I think we need an explicit on-card "cleanup" method which closes subscriptions and
		// removes this card from any parents
		// reset of render tree should probably be in there ...
		if (card._renderTree) {
			var div = document.getElementById(card._renderTree._id);
			div.innerHTML = '';
			card._renderTree = null;
		}
	};
}

Application.prototype._readyCards = function(_cxt, ev, cards) {
	for (var i=0;i<cards.length;i++) {
		ev.add(readyOne(this, cards[i].name));
	}
}

Application.prototype.readyCard = function(_cxt, name) {
	var card = this.cards[name];
	var ctr = _cxt.findContractOnCard(card, "Lifecycle");
	if (ctr && ctr.ready) {
		var msgs = ctr.ready(_cxt);
		_cxt.env.queueMessages(_cxt, msgs);
	}
}

function readyOne(appl, name) {
	return (_cxt) => {
		var card = appl.cards[name];
		var ctr = _cxt.findContractOnCard(card, "Lifecycle");
		if (ctr && ctr.ready) {
			var msgs = ctr.ready(_cxt);
			_cxt.env.queueMessages(_cxt, msgs);
		}
	};
}

Application.prototype._routeActions = function(_cxt, ev, enter) {
	for (var i=0;i<enter.length;i++) {
		ev.add(oneAction(this, enter[i]));
	}
}

Application.prototype.oneAction = function(_cxt, a) {
	var card = this.cards[a.card];
	var ctr = _cxt.findContractOnCard(card, a.contract);
	if (ctr) {
		var m = a.action;
		if (ctr[m]) {
			var callWith = [ _cxt ];
			for (var ai=0;ai<a.args.length;ai++) {
				var aa = a.args[ai];
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
			var msgs = ctr[m].apply(ctr, callWith);
			_cxt.env.queueMessages(_cxt, msgs);
		}
	}
}

function oneAction(appl, a) {
	return (_cxt) => {
		var card = appl.cards[a.card];
		var ctr = _cxt.findContractOnCard(card, a.contract);
		if (ctr) {
			var m = a.action;
			if (ctr[m]) {
				var callWith = [ _cxt ];
				for (var ai=0;ai<a.args.length;ai++) {
					var aa = a.args[ai];
					if (aa.str) {
						callWith.push(aa.str);
					} else if (aa.ref) {
						callWith.push(appl.cards[aa.ref]);
					} else if (aa.param) {
						callWith.push(appl.params[aa.param]);
					} else if (aa.expr) {
						callWith.push(appl[aa.expr].call(appl, _cxt));
					} else
						throw new Error("huh? " + JSON.stringify(aa));
				}
				var msgs = ctr[m].apply(ctr, callWith);
				_cxt.env.queueMessages(_cxt, msgs);
			}
		}
	};
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

function EnterEvent(appl, div) {
	this.appl = appl;
	this.div = div;
	this.actions = [];
	this.andThenMsg = null;
	this.cnt = 0;
}

EnterEvent.prototype.add = function(r) {
	this.actions.push(r);
}

EnterEvent.prototype.andThen = function(at) {
	this.andThenMsg = at;
}

EnterEvent.prototype.dispatch = function(_cxt) {
	if (this.cnt < this.actions.length) {
		this.actions[this.cnt](_cxt);
	} else if (this.cnt == this.actions.length && this.div) {
		this.appl.cards['main']._renderInto(_cxt, this.div);
	} else if ((this.cnt == this.actions.length && !this.div) ||
			   (this.cnt == this.actions.length+1 && this.div)) {
		if (this.andThenMsg)
			this.andThenMsg.dispatch(_cxt);
	} else
		return;

	this.cnt++;
	_cxt.env.queueMessages(_cxt, this);
	return;
}

function MoveDownEvent(appl, routing, path, allDone) {
	this.appl = appl;
	this.routing = routing;
	this.path = path;
	this.allDone = allDone;
}

MoveDownEvent.prototype.dispatch = function(_cxt) {
	this.appl.moveDown(_cxt, this.routing, this.path, this.allDone);
}

MoveDownEvent.prototype.toString = function() {
	return "MDE[" + this.path + "]";
}

function MoveUpEvent(appl, cmn, path) {
	this.appl = appl;
	this.cmn = cmn;
	this.path = path;
}

MoveUpEvent.prototype.dispatch = function(_cxt) {
	if (this.appl.currentRoute.length > this.cmn+1) {
		this.appl.moveUp(_cxt);
		_cxt.env.queueMessages(_cxt, this);
	} else {
		_cxt.env.queueMessages(_cxt, new MoveDownEvent(this.appl, this.appl.currentRoute[this.cmn].routes, this.path));
	}
}

MoveUpEvent.prototype.toString = function() {
	return "MUE[" + this.cmn + "]";
}

export { Application };
