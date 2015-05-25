var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
var PKG = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/test.ziniki/counter.js', 'utf8'));

var myCounter = new (PKG.CounterObj)({ inc: 7 });
console.log("counter = ",  myCounter);
var myCard = new test.ziniki.CounterCard({ parentCard: 'some-port' });
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

