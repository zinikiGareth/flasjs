// Static methods go on Flasck

Flasck = {};

Flasck.provideService = function(postbox, services, clz) {
	var addr = postbox.newAddress();
	var svc = new clz();
	postbox.register(addr, svc);
	services['test.ziniki.Timer'] = postbox.unique(addr);
}

Flasck.createCard = function(postbox, inside, cardInfo, services) {
	// create an object that is the creator's handle to the card
	var handle = new FlasckHandle(this);

	// this is the thing that's supposed to handle our end of the Init contract
	var myEnd = postbox.newAddress();
	var myAddr = postbox.unique(myEnd);
	var initService = {
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
	
	wrapper.cardCreated(myCard);
	
	return handle;
}
