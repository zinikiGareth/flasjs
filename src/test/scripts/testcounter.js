var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/flasck.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/services.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/handle.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/postbox.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/wrapper.js', 'utf8'));
//var PKG = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/test.ziniki/counter.js', 'utf8'));
var PKG = vm.runInThisContext(fs.readFileSync('../../../../FLAS2/src/test/resources/cards/test.ziniki/test.ziniki.js', 'utf8'));
//var PKG = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/test.ziniki/desired.js', 'utf8'));
//var PKG = vm.runInThisContext(fs.readFileSync('../scripts/desired.js', 'utf8'));

//Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;
var body = doc.getElementsByTagName("body")[0];

// So this is a perfectly normal object we're creating to start the ball rolling
var myCounter = new (PKG.CounterObj)({ inc: 3 });
//console.log("counter = ",  myCounter);

// Create a new card-containing environment with services
var postbox = new Postbox("main");
var services = {};
Flasck.provideService(postbox, services, 'test.ziniki.Timer', new FlasckServices.TimerService(postbox));

	var handle = Flasck.createCard(postbox, body, { explicit: test.ziniki.CounterCard, mode: 'local'}, services);

//Tell it to load the basic object, and see what it says
console.log("ready");
