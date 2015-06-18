// Static methods go on Flasck

Flasck = {};

Flasck.provideService = function(postbox, services, svcName, svc) {
	var addr = postbox.newAddress();
	postbox.register(addr, svc);
	services[svcName] = postbox.unique(addr);
}

Flasck.createCard = function(postbox, inside, cardInfo, services) {
	// create an object that is the creator's handle to the card
	var handle = new FlasckHandle(this);

	// this is the thing that's supposed to handle our end of the Init contract
	var myEnd = postbox.newAddress();
	var myAddr = postbox.unique(myEnd);
	var initService = {
		process: function(message) {
//			console.log("need to process", message);
			if (message.method === 'ready')
				this.ready(message.from, message.args[0]);
			else
				throw new Error("Cannot process " + message.method);
		},
		ready: function(from, contracts) {
			handle.contracts = contracts;
			var reply = {};
			for (var ctr in contracts) {
				if (services[ctr])
					reply[ctr] = services[ctr];
			}
			console.log("ah ... card is ready and wants ", contracts, " and will get ", reply);
			postbox.deliver(from, {from: myAddr, method: "services", args: [reply]});
			postbox.deliver(from, {from: myAddr, method: "state", args: [] })
			if (contracts['org.ziniki.Render'])
				postbox.deliver(contracts['org.ziniki.Render'], {from: myAddr, method: "render", args: [{into: inside}] });
		}
	};
	services['org.ziniki.Init'] = myAddr;
	postbox.register(myEnd, initService);
	
	// TODO: this assumes that we are creating an explicit card locally, which is not always true
	var cardClz = cardInfo.explicit;
	
	// Create a wrapper around the card which is its proto-environment to link back up to the real environment
	var wrapper = new FlasckWrapper(postbox, myAddr, cardClz, inside);

	// Now create the card and tell the wrapper about it
	var myCard = new cardClz({ wrapper: wrapper });
	console.log("Creating card", myCard._ctor);
	console.log("registering " + myAddr + " for init contract");
	for (var s in myCard._services) {
		console.log("svc " + s);
		Flasck.provideService(postbox, services, s, new FlasckWrapper.Processor(myCard._services[s]));
	}
	console.log("These services are available:", services);
	
	wrapper.cardCreated(myCard);
	
	return handle;
}
