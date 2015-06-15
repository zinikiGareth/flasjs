// So this is the stuff that loading an HTML file would do ...

var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
var StdLib = vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../../../../FLAS2/src/test/resources/cards/com.helpfulsidekick.chaddy/com.helpfulsidekick.chaddy.js', 'utf8'));
// vm.runInThisContext(fs.readFileSync('../scripts/want-chaddy.js', 'utf8'));

// Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;

// grab the body to put things in
var body = doc.getElementsByTagName("body")[0];

// Create a new card-containing environment with services
var env = new FlasckContainer();
env.addService("org.ziniki.Init", new FlasckService.InitService());
env.addService("org.ziniki.Timer", new FlasckService.TimerService());
env.addService("org.ziniki.OnCounter", new FlasckService.OnTickService());

var handle = env.createCard(com.helpfulsidekick.chaddy.Main, body, ['org.ziniki.Init']);

console.log(body.innerHTML);
//var click = doc.getElementById("id_11").onclick;
//console.log(click);
//click.apply(null, ["event"]);
//console.log(body.innerHTML);
