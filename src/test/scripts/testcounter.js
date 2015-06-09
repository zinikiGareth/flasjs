var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
//var PKG = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/test.ziniki/counter.js', 'utf8'));
//var PKG = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/test.ziniki/test.ziniki.js', 'utf8'));
//var PKG = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/test.ziniki/desired.js', 'utf8'));
var PKG = vm.runInThisContext(fs.readFileSync('../scripts/desired.js', 'utf8'));

//Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;

// So this is a perfectly normal object we're creating to start the ball rolling
var myCounter = new (PKG.CounterObj)({ inc: 3 });
//console.log("counter = ",  myCounter);

// Create a new card-containing environment with services
var env = new FlasckContainer();
env.addService("test.ziniki.Init", new FlasckService.InitService());
env.addService("test.ziniki.Timer", new FlasckService.TimerService());
env.addService("test.ziniki.OnCounter", new FlasckService.OnTickService());

// We need something that can issue IDs
// We actually want one of these per sandbox
idgen = function() {
	this.id = 1;
	this.next = function() {
		return "flasck_" + this.id++;
	}
	return this;
}();

// Now we simulate the creation of a card and link them together
// should this be a simple function of the "createLocalCard/createSandboxCard" variety?

// create a div to put the HTML content for the card inside
var myid = idgen.next();
var mydiv = DOM.Element('div', { _ctor: 'Cons', head: { members: ['id', myid]}}, {_ctor: 'Nil'});
//console.log(mydiv.toString());
var body = doc.getElementsByTagName("body")[0];
var actualDiv = body.appendChild(mydiv.toElement(doc));
//console.log(actualDiv);
//console.log(body.innerHTML);

// create a connection pair
var handle = new FlasckHandle(env);
var downconn = new DownConnection(handle);
handle.conn = downconn;
var upconn = new UpConnection(env);
downconn.up = upconn;
upconn.down = downconn;

// Create a wrapper around the card which is its proto-environment to link back up to the real environment
var wrapper = new FlasckWrapper(upconn, actualDiv, ['test.ziniki.Init', 'test.ziniki.Timer']);

// Now create the card and tell the wrapper about it
var myCard = new test.ziniki.CounterCard({ wrapper: wrapper });
wrapper.cardCreated(myCard);

console.log("ready");
// Tell it to load the basic object, and see what it says
handle.send('test.ziniki.Init', 'load', myCounter);
console.log("back in event loop");