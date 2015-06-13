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
var body = doc.getElementsByTagName("body")[0];

// So this is a perfectly normal object we're creating to start the ball rolling
var myCounter = new (PKG.CounterObj)({ inc: 3 });
//console.log("counter = ",  myCounter);

// Create a new card-containing environment with services
var env = new FlasckContainer();
env.addService("test.ziniki.Init", new FlasckService.InitService());
env.addService("test.ziniki.Timer", new FlasckService.TimerService());
env.addService("test.ziniki.OnCounter", new FlasckService.OnTickService());

var handle = env.createCard(test.ziniki.CounterCard, body, ['test.ziniki.Init', 'test.ziniki.Timer', 'test.ziniki.OnCounter']);

//Tell it to load the basic object, and see what it says
console.log("ready");
// Tell it to load the basic object, and see what it says
handle.send('test.ziniki.Init', 'load', myCounter);
console.log("back in event loop");