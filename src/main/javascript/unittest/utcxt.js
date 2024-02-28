import FLContext from "../runtime/flcxt";

const UTContext = function(env, broker) {
	FLContext.call(env, broker);
}

UTContext.prototype = FLContext.prototype;
UTContext.prototype.constructor = UTContext;

UTContext.prototype.storeMock = function(name, value) {
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

UTContext.prototype.mockContract = function(contract) {
	const ret = new MockContract(contract);
	this.broker.register(contract.name(), ret);
	return ret;
}

UTContext.prototype.mockAgent = function(agent) {
	return this.env.mockAgent(this, agent);
}

UTContext.prototype.mockCard = function(name, card) {
	return this.env.mockCard(this, name, card);
}

UTContext.prototype.explodingHandler = function() {
	const ret = new ExplodingIdempotentHandler(this);
	return ret;
}

UTContext.prototype.mockHandler = function(contract) {
	const ret = new MockHandler(contract);
	return ret;
}

export { UTContext };