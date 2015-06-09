var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
var StdLib = vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/cards/com.helpfulsidekick.chaddy/com.helpfulsidekick.chaddy.js', 'utf8'));

// Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;
var body = doc.getElementsByTagName("body")[0];

var env = { wrapper: null };
var card = new com.helpfulsidekick.chaddy.Navbar(env);

var nextid = 1;
function renderTree(doc, into, card, tree) {
  var line = FLEval.full(tree.fn.apply(card));
  var html;
  if (line instanceof DOM._Element) {
    html = line.toElement(doc);
  } else if (tree.type == 'content') {
    html = doc.createElement("span");
    html.appendChild(doc.createTextNode(line.toString()));
  }
  // TODO: track the things we do in a cached state
  html.setAttribute('id', 'id_' + nextid++);
  if (tree.type === 'div') {
    for (var c=0;c<tree.children.length;c++) {
      renderTree(doc, html, card, tree.children[c]);
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

com.helpfulsidekick.chaddy.Navbar.prototype._handleEvent_1 = function(ev) {
  console.log(ev);
}

var tree = {
    type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_1, class: ['nav-bar'], children: [{
      type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_2, class: ['w-container'], children:[{
        type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_3, class: ['w-row'], children:[{
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_4, class: ['w-col', 'w-col-4', 'brand-column'], children:[{
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_5, class: []
          }]
        }, {
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_6, class: ['w-col', 'w-col-8', 'nav-column'], children:[{
            type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_7, class: [], children:[{
              type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_8, class: []
            }], events: { 'click': com.helpfulsidekick.chaddy.Navbar.prototype._handleEvent_1 }
          }, {
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_9, class: []
          }]
        }]
      }]
    }]
};

renderTree(doc, body, card, tree);
console.log(body.innerHTML);
