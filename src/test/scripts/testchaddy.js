var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
var StdLib = vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
// vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/com.helpfulsidekick.chaddy/com.helpfulsidekick.chaddy.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../scripts/want-chaddy.js', 'utf8'));

// Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;
var body = doc.getElementsByTagName("body")[0];

var env = { wrapper: null };
var card = new com.helpfulsidekick.chaddy.Navbar(env);

function dispatchEvent(card, ev, handler) {
	var msgs = FLEval.full(new FLClosure(card, handler, [ev]));
	console.log(msgs);
}

var nextid = 1;
function renderTree(doc, into, card, tree) {
  var line = FLEval.full(tree.fn.apply(card));
  var html;
  if (line instanceof DOM._Element) {
    html = line.toElement(doc);
    console.log(line.events);
    var evh = line.events;
    while (evh && evh._ctor === 'Cons') {
      var ev = evh.head;
      if (ev._ctor === 'Tuple' && ev.length === 2) {
    	  html['on'+ev.members[0]] = function(event) { dispatchEvent(card, event, ev.members[1]); }
      }
      evh = evh.tail;
    }
  } else if (tree.type == 'content') {
    html = doc.createElement("span");
    html.appendChild(doc.createTextNode(line.toString()));
  }
  // TODO: track the things we do in a cached state
  html.setAttribute('id', 'id_' + nextid++);
  if (tree.type === 'div') {
	if (tree.children) {
      for (var c=0;c<tree.children.length;c++) {
        renderTree(doc, html, card, tree.children[c]);
      }
	}
  }
  if (tree.class && tree.class.length > 0)
    html.setAttribute('class', tree.class.join(' '));
  for (var p in tree.events)
    if (tree.events.hasOwnProperty(p)) {
//      console.log(p + " => " + tree.events[p]);
      html["on"+p] = tree.events[p];
    }
  into.appendChild(html);
}

renderTree(doc, body, card, com.helpfulsidekick.chaddy.Navbar.template );
console.log(body.innerHTML);
var click = doc.getElementById("id_7").onclick;
console.log(click);
click.apply(card, ["event"]);