var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
var StdLib = vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));

// Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;

// Build up an "in-memory" view of the DOM we want to show
var attr1 = StdLib.Tuple.tuple("id", "k16");
var attrMap = FLEval.closure(StdLib.List.cons, attr1, new FLEval.closure(StdLib.List.nil));
var contents = FLEval.closure(StdLib.List.nil);
var emptyDiv = FLEval.closure(DOM.Element.element, "div", FLEval.closure(StdLib.List.nil), FLEval.closure(StdLib.List.nil));
contents = FLEval.closure(StdLib.List.cons, emptyDiv, contents);
contents = FLEval.closure(StdLib.List.cons, "hello world", contents);
var e1 = DOM.Element.element("div", attrMap, contents);

// Fully evaluate it so that we can traverse it
e1 = FLEval.full(e1);

// Check we got what we thought
var e1s = e1.toString();
if (e1s !== 'Element div [(id,k16)] [hello world,Element div [] []]')
	throw new Error("Didn't get the DOM we expected");

// Put it in the body
var body = doc.getElementsByTagName("body")[0];
body.appendChild(e1.toElement(doc));
console.log(body.innerHTML);