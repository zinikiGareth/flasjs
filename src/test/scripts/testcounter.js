var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
var PKG = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/test.ziniki/counter.js', 'utf8'));
//var PKG = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/test.ziniki/desired.js', 'utf8'));

// So this is a perfectly normal object we're creating to start the ball rolling
var myCounter = new (PKG.CounterObj)({ inc: 3 });
console.log("counter = ",  myCounter);

// Create a new card-containing environment with services
var env = new FlasckContainer();
env.addService("test.ziniki.Init", new FlasckService.InitService());
env.addService("test.ziniki.Timer", new FlasckService.TimerService());
env.addService("test.ziniki.OnCounter", new FlasckService.OnTickService());

// Now we simulate the creation of a card and link them together
// should this be a simple function of the "createLocalCard/createSandboxCard" variety?

// create a conection pair
var handle = new FlasckHandle(env);
var downconn = new DownConnection(handle);
handle.conn = downconn;
var upconn = new UpConnection(env);
downconn.up = upconn;
upconn.down = downconn;


// Create a wrapper around the card which is its proto-environment to link back up to the real environment
var wrapper = new FlasckWrapper(upconn, ['test.ziniki.Init', 'test.ziniki.Timer']);
// Now create the card and tell the wrapper about it
var myCard = new test.ziniki.CounterCard({ wrapper: wrapper });
wrapper.cardCreated(myCard);

// Tell it to load the basic object, and see what it says
handle.send('test.ziniki.Init', 'load', myCounter);

// var msgs = wrapper.deliver('test.ziniki.Init', 'load', myCounter);
// wrapper.processMessages(msgs);
/*
var res = myCard.contracts['test.ziniki.Init'].load(myCounter);
console.log("res = ", res);
var msgs = FLEval.full(res);
console.log(msgs);
console.log("Msg1:", msgs.head._ctor, msgs.head.method);
console.log("Arg1:", msgs.head.args.head);
console.log("Arg2:", msgs.head.args.tail.head);
console.log(myCard);

// Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;
*/
