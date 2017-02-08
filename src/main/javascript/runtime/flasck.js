// Static methods go on Flasck

Flasck = {};

Flasck.nextCard = 0;

Flasck.provideService = function(postbox, services, svcName, svc) {
	var addr = postbox.newAddress();
	postbox.register(addr, svc);
	svc._myAddr = services[svcName] = postbox.unique(addr);
}

Flasck.createCard = function(postbox, inside, cardInfo, services) {
	// create a "parent" view of the world
	var myAddr;
	if (cardInfo.mode === 'in_iframe') {
		postbox.connect("main", cardInfo.mainWindow);
		myAddr = cardInfo.addr;
	} else {
		// this is the thing that's supposed to handle our end of the Init contract
		var myEnd = postbox.newAddress();
		myAddr = postbox.unique(myEnd);
	
		// create an object that is the creator's handle to the card
		var handle = new FlasckHandle(postbox, myAddr);
	
		var initService = {
			process: function(message) {
	//			console.log("need to process", message);
				if (message.method === 'ready')
					this.ready(message.from, message.args[0]);
				else
					throw new Error("Cannot process " + message.method);
			},
			ready: function(from, contracts) {
				var reply = {};
				for (var ctr in contracts) {
					if (services[ctr]) {
						reply[ctr] = services[ctr];
						handle.channels[ctr] = contracts[ctr];
					}
				}
				// hack ... but we need something like this for pass-through
				for (var s in services) {
					if (!reply[s])
						reply[s] = services[s];
				}
				// end hack
	//			console.log("ah ... card is ready and wants ", contracts, " and will get ", reply);
				postbox.deliver(from, {from: myAddr, method: "services", args: [reply]});
				postbox.deliver(from, {from: myAddr, method: "state", args: [] });
				if (cardInfo.loadId)
					postbox.deliver(from, {from: myAddr, method: "loadId", args: [cardInfo.loadId] });
				if (contracts['org.flasck.Render']) {
					// it's not possible to clone a div across boundaries; only do this if we are passing locally
					// the "in_iframe" case needs to figure its own div
					var divarg = null;
					if (cardInfo.mode !== 'remote')
						divarg = inside;
					postbox.deliver(contracts['org.flasck.Render'], {from: myAddr, method: "render", args: [{into: divarg}] }); 
				}
				for (var i=0;i<handle.pending.length;i++) {
					var msg = handle.pending[i];
					var chan = handle.channels[msg.ctr];
					if (!chan)
						throw new Error("There is no channel " + msg.ctr);
					delete msg.ctr;
					handle.postbox.deliver(chan, msg);
				}
				delete handle.pending;
			}
		};
		services['org.flasck.Init'] = myAddr;
		postbox.register(myEnd, initService);
	}
	
	// now create a "child" view of the world	
	if (cardInfo.mode === 'local' || cardInfo.mode === 'in_iframe' || cardInfo.mode === 'overlay') {
		var cardClz = cardInfo.explicit;
		if (!cardClz)
			throw new Error("Must specify a valid card class object in cardInfo.explicit");
		
		// Create a wrapper around the card which is its proto-environment to link back up to the real environment
		var wrapper = new FlasckWrapper(postbox, myAddr, cardClz, inside, "card_" + (++Flasck.nextCard));
	
		// Now create the card and tell the wrapper about it
		var myCard = cardClz({ wrapper: wrapper });
	//	console.log("Creating card", myCard._ctor);
		for (var s in myCard._services) {
	//		console.log("providing service " + s);
			var serv = myCard._services[s]; 
			if (!serv)
				throw new Error("cannot provide service " + s);
			Flasck.provideService(postbox, services, s, new FlasckWrapper.Processor(wrapper, serv));
		}
	//	console.log("These services are available:", services);
		
		wrapper.cardCreated(myCard);
	} else if (cardInfo.mode === 'remote') {
		function connectPB(name, id) {
			console.log("need to show " + id + " through " + name);
		}
		
	    var url = cardInfo.url;
	    var idx = url.indexOf("?");
	    if (idx == -1)
	    	url = url + "?";
	    else
	    	url = url + "&";
	    var newpb = Math.random().toString().substring(2);
		postbox.remote(newpb, function(name) { connectPB(name, s); });
	    url += "postbox="+newpb +"&myAddr="+myAddr;
		inside.innerHTML = "<iframe src='" + url + "'></iframe>";
	} else
		throw new Error("Cannot handle card creation mode: " + cardInfo.mode);
	
	return handle;
}