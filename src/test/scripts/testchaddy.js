// So this is the stuff that loading an HTML file would do ...

var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
var StdLib = vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
//vm.runInThisContext(fs.readFileSync('../javascript/flasck/container.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/flasck.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/services.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/handle.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/postbox.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/flasck/wrapper.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../../../../FLAS2/src/test/resources/cards/com.helpfulsidekick.chaddy/com.helpfulsidekick.chaddy.js', 'utf8'));

// Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;

// grab the body to put things in
var body = doc.getElementsByTagName("body")[0];
var div = doc.createElement("div");
body.appendChild(div);

var postbox = new Postbox("main");
var services = {};
Flasck.provideService(postbox, services, "org.ziniki.Timer", new FlasckServices.TimerService());

var handle = Flasck.createCard(postbox, div, { explicit: com.helpfulsidekick.chaddy.Main, mode: 'local' }, services);

console.log(body.innerHTML);
var click = doc.getElementById("id_12").onclick;
console.log("clicking on " + click);
//console.log(click);
click.apply(null, ["event"]);
//console.log(body.innerHTML);
