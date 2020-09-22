const FLClosure = require('./closure');
const FLCurry = require('./curry');
const FLMakeSend = require('./makesend');
const FLError = require('./error');
const { MockContract, MockAgent, MockCard, ExplodingIdempotentHandler } = require('../unittest/mocks');
const { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } = require('./messages');
const { EvalContext, FieldsContainer } = require('../../resources/ziwsh');
//--REQUIRE

const FLContext = function(env, broker) {
	EvalContext.call(this, env, broker);
}

FLContext.prototype = new EvalContext();
FLContext.prototype.constructor = FLContext;

FLContext.prototype.addAll = function(ret, arr) {
	this.env.addAll(ret, arr);
}

FLContext.prototype.closure = function(fn, ...args) {
	return new FLClosure(null, fn, args);
}

FLContext.prototype.oclosure = function(fn, obj, ...args) {
	return new FLClosure(obj, fn, args);
}

FLContext.prototype.curry = function(reqd, fn, ...args) {
	var xcs = {};
	for (var i=0;i<args.length;i++) {
		xcs[i+1] = args[i];
	}
	return new FLCurry(null, fn, reqd, xcs);
}

FLContext.prototype.ocurry = function(reqd, fn, obj, ...args) {
	var xcs = {};
	for (var i=0;i<args.length;i++) {
		xcs[i+1] = args[i];
	}
	return new FLCurry(obj, fn, reqd, xcs);
}

FLContext.prototype.xcurry = function(reqd, ...args) {
	var fn;
	var xcs = {};
	for (var i=0;i<args.length;i+=2) {
		if (args[i] == 0)
			fn = args[i+1];
		else
			xcs[args[i]] = args[i+1];
	}
	return new FLCurry(null, fn, reqd, xcs);
}

FLContext.prototype.array = function(...args) {
	return args;
}

FLContext.prototype.makeTuple = function(...args) {
	return Tuple.eval(this, args);
}

FLContext.prototype.hash = function(...args) {
	var ret = {};
	for (var i=0;i<args.length;i++) {
		var hp = this.head(args[i]);
		if (!(hp instanceof HashPair))
			return new FLError("member was not a hashpair");
		var m = this.full(hp.m);
		ret[m] = hp.o;
	}
	return ret;
}

FLContext.prototype.applyhash = function(basic, hash) {
	basic = this.head(basic);
	if (basic instanceof FLError)
		return basic;
	hash = this.spine(hash);
	if (hash instanceof FLError)
		return hash;
	// TODO: we might need to clone basic before updating it, if it can be shared ...
	var okh = Object.keys(hash);
	for (var i=0;i<okh.length;i++) {
		var p = okh[i];
		if (!basic.state.has(p))
			return new FLError('cannot override member: ' + p);
		basic.state.set(p, hash[p]);
	}
	return basic;
}

FLContext.prototype.tupleMember = function(tuple, which) {
	tuple = this.head(tuple);
	if (!tuple instanceof Tuple)
		throw "not a tuple: " + tuple;
	return tuple.args[which];
}

FLContext.prototype.error = function(msg) {
	return FLError.eval(this, msg);
}

FLContext.prototype.mksend = function(meth, obj, cnt, handler) {
	if (cnt == 0)
		return Send.eval(this, obj, meth, [], handler);
	else
		return new FLMakeSend(meth, obj, cnt, handler);
}

FLContext.prototype.mkacor = function(meth, obj, cnt) {
	if (cnt == 0) {
		if (typeof obj === 'undefined' || obj === null)
			return obj;
		else
			return this.oclosure(meth, obj);
	}
	else {
		if (typeof obj === 'undefined' || obj === null)
			throw new Error("we want to return a curry of " + cnt + " args which ultimately returns undefined");
		else
			return this.ocurry(cnt, meth, obj);
	}
}

FLContext.prototype.makeStatic = function(clz, meth) {
	const oc = this.objectNamed(clz);
	const ocm = oc[meth];
	const ret = function(...args) {
		return ocm.apply(null, args);
	};
	ret.nfargs = ocm.nfargs;
	return ret;
}

FLContext.prototype.head = function(obj) {
	while (obj instanceof FLClosure)
		obj = obj.eval(this);
	return obj;
}

FLContext.prototype.spine = function(obj) {
	obj = this.head(obj);
	if (obj instanceof FLError)
		return obj;
	if (Array.isArray(obj))
		return obj;
	if (obj.constructor === Object) {
		return obj;
	}
	throw Error("spine should only be called on lists");
}

FLContext.prototype.full = function(obj) {
	obj = this.head(obj);
	if (obj == null) {
		// nothing to do
	} else if (obj._full) {
		obj._full(this);
	} else if (Array.isArray(obj)) {
		for (var i=0;i<obj.length;i++)
			obj[i] = this.full(obj[i]);
	} else if (obj.state instanceof FieldsContainer) {
		var ks = Object.keys(obj.state.dict);
		for (var i=0;i<ks.length;i++) {
			obj.state.dict[ks[i]] = this.full(obj.state.dict[ks[i]]);
		}
	}
	return obj;
}

FLContext.prototype.isTruthy = function(val) {
	val = this.full(val);
	return !!val;
}

FLContext.prototype.isA = function(val, ty) {
	if (val instanceof Object && '_areYouA' in val) {
		return val._areYouA(this, ty);
	}
	switch (ty) {
	case 'Any':
		return true;
	case 'Boolean':
		return val === true || val === false;
	case 'True':
		return val === true;
	case 'False':
		return val === false;
	case 'Number':
		return typeof(val) == 'number';
	case 'String':
		return typeof(val) == 'string';
	case 'List':
		return Array.isArray(val);
	case 'Nil':
		return Array.isArray(val) && val.length == 0;
	case 'Cons':
		return Array.isArray(val) && val.length > 0;
	default:
		return false;
	}
}

FLContext.prototype.compare = function(left, right) {
	if (typeof(left) === 'number' || typeof(left) === 'string') {
		return left === right;
	} else if (Array.isArray(left) && Array.isArray(right)) {
		if (left.length !== right.length)
			return false;
		for (var i=0;i<left.length;i++) {
			if (!this.compare(left[i], right[i]))
				return false;
		}
		return true;
	} else if (left instanceof FLError && right instanceof FLError) {
		return left.message === right.message;
	} else if (left._compare) {
		return left._compare(this, right);
	} else if (left.state && right.state && left.state instanceof FieldsContainer && right.state instanceof FieldsContainer) {
		return left.state._compare(this, right.state);
	} else
		return left == right;
}

FLContext.prototype.field = function(obj, field) {
	obj = this.full(obj);
	if (Array.isArray(obj)) {
		if (field == 'head') {
			if (obj.length > 0)
				return obj[0];
			else
				return this.error('head(nil)');
		} else if (field == 'tail') {
			if (obj.length > 0)
				return obj.slice(1);
			else
				return this.error('tail(nil)');
		} else
			return this.error('no function "' + field + "'");
	} else {
		// assume it's a fields document with a state object
		// This is possibly a bogus assumption
		return obj.state.get(field);
	}
}

FLContext.prototype.nextDocumentId = function() {
	return "flaselt_" + (this.env.nextDivId++);
}

FLContext.prototype.attachEventToCard = function(card, handlerInfo, div, wrapper) {
	const eventName = handlerInfo.event._eventName;
	if (div) {
		var id1 = this.env.evid++;
		// this.env.logger.log("adding handler " + id1 + " to " + div.id + " for " + eventName);
		var handler = ev => {
			// this.env.logger.log("firing handler " + id1 + " to " + div.id + " for " + eventName);
			const ecx = this.env.newContext();
			const fev = handlerInfo.event.eval(ecx);
			const evt = new FLEventSourceTrait(div, wrapper.value);
			fev["EventSource"] = evt;
			ecx.handleEvent(card, handlerInfo.handler, fev);
			ev.stopPropagation();
			ev.preventDefault();
		};
		div.addEventListener(eventName, handler);
		return handler;
	}
	return null;
}

FLContext.prototype.handleEvent = function(card, handler, event) {
	var reply = [];
	if (handler) {
		reply = handler.call(card, this, event);
	}
	reply.push(new UpdateDisplay(this, card));
	this.env.queueMessages(this, reply);
}

FLContext.prototype.localCard = function(cardClz, elt) {
	const card = new cardClz(cx);
	card._renderInto(cx, document.getElementById(elt));
	var lc = this.findContractOnCard(card, "Lifecycle");
	if (lc && lc.init) {
		var msgs = lc.init(this);
		this.env.queueMessages(this, msgs);
	}
	if (lc && lc.ready) {
		var msgs = lc.ready(this);
		this.env.queueMessages(this, msgs);
	}
	return card;
}

FLContext.prototype.findContractOnCard = function(card, ctr) {
	for (var ce in Object.getOwnPropertyDescriptors(card._contracts)) {
		if (card._contracts[ce][ctr])
			return card._contracts[ce][ctr];
	}
}

FLContext.prototype.needsUpdate = function(card) {
	if (typeof this.updateCards === 'undefined')
		throw Error("cannot update when not in event loop");
	if (!this.updateCards.includes(card))
		this.updateCards.push(card);
}

FLContext.prototype.storeMock = function(name, value) {
	value = this.full(value);
	if (value instanceof ResponseWithMessages) {
		this.env.queueMessages(this, ResponseWithMessages.messages(this, value));
		// because this is a test operation, we dispatch the messages immediately
		this.env.dispatchMessages(this);
		value = ResponseWithMessages.response(this, value);
	}
	if (value instanceof FLObject) {
		var mock = new MockFLObject(value);
		this.env.mocks[name] = mock;
		this.env.cards.push(mock);
	} else
		this.env.mocks[name] = value;
	return value;
}

FLContext.prototype.mockContract = function(contract) {
	const ret = new MockContract(contract);
	this.broker.register(contract.name(), ret);
	return ret;
}

FLContext.prototype.mockAgent = function(agent) {
	return this.env.mockAgent(this, agent);
}

FLContext.prototype.mockCard = function(name, card) {
	return this.env.mockCard(this, name, card);
}

FLContext.prototype.explodingHandler = function() {
	const ret = new ExplodingIdempotentHandler(this);
	return ret;
}

FLContext.prototype.mockHandler = function(contract) {
	const ret = new MockHandler(contract);
	return ret;
}

FLContext.prototype.newdiv = function(cnt) {
	this.env.newdiv(cnt);
}

// show value or expr depending on whether individual nodes are evaluated or not
FLContext.prototype.show = function(val) {
// HACK !  We should map it into a string repn properly
	return "" + val;
}

//--EXPORT
/* istanbul ignore else */ 
if (typeof(module) !== 'undefined')
	module.exports = FLContext;
else
	window.FLContext = FLContext;