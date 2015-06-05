var fs = require('fs');
var vm = require('vm');
var jsdom = require("jsdom").jsdom;

// read in the FL environment, the standard library and the DOM library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../javascript/builtin.js', 'utf8'));
var StdLib = vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));
var DOM = vm.runInThisContext(fs.readFileSync('../javascript/dom.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('../../../../flasckfl/src/test/resources/cards/com.helpfulsidekick.chaddy/com.helpfulsidekick.chaddy.js', 'utf8'));

// Read in the minimal HTML file
var html = fs.readFileSync('simple.html', 'utf8');
var doc = jsdom(html, {});
var window = doc.defaultView;
var body = doc.getElementsByTagName("body")[0];

var env = { wrapper: null };
var card = new com.helpfulsidekick.chaddy.Navbar(env);

// This is a hand simulation of "init" of the "tree" structure
var n1 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_1(card));
var e1 = n1.toElement(doc);
e1.setAttribute("class", "nav-bar");
var n2 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_2(card));
var e2 = n2.toElement(doc);
e2.setAttribute("class", "w-container");
e1.appendChild(e2);
var n3 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_3(card));
var e3 = n3.toElement(doc);
e3.setAttribute("class", "w-row");
e2.appendChild(e3);
var n4 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_4(card));
var e4 = n4.toElement(doc);
e4.setAttribute("class", "w-col w-col-4 brand-column");
e3.appendChild(e4);
var n5 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_5(card));
var e5 = n5.toElement(doc);
e5.setAttribute('src', 'chaddy.jpg');
e5.setAttribute('width', '32');
e4.appendChild(e5);
var n6 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_6(card));
var e6 = n6.toElement(doc);
e6.setAttribute("class", "w-col w-col-8 nav-column");
e3.appendChild(e6);
var n7 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_7(card));
var e7 = n7.toElement(doc);
e7.setAttribute("title", "dashboard");
e7.setAttribute("class", "nav-link current-link");
e7.onclick = function(ev) { console.log(ev); }
e6.appendChild(e7);
var n8 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_8(card));
var e8 = doc.createElement("span");
e8.appendChild(doc.createTextNode(n8));
e7.appendChild(e8);

//var v = com.helpfulsidekick.chaddy.Navbar._templateNode_9(card);
//console.log(v);
//v = FLEval.head(v);
//console.log(v);

var n9 = FLEval.full(com.helpfulsidekick.chaddy.Navbar._templateNode_9(card));
var e9 = n9.toElement(doc);
e6.appendChild(e9);

body.appendChild(e1);
console.log(body.innerHTML);
body.innerHTML = '';
console.log(body.innerHTML);

var nextid = 1;
function renderTree(doc, into, card, tree) {
  var line = FLEval.full(tree.fn(card));
  var html;
  if (line instanceof DOM._Element) {
    html = line.toElement(doc);
  } else if (tree.type == 'content') {
    html = doc.createElement("span");
    html.appendChild(doc.createTextNode(line.toString()));
  }
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
      console.log(p + " => " + tree.events[p]);
      html[p] = tree.events[p];
    }
  into.appendChild(html);
}

com.helpfulsidekick.chaddy.Navbar._handleEvent_1 = function(ev) {
  console.log(ev);
}

var tree = {
    type: 'div', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_1, class: ['nav-bar'], children: [{
      type: 'div', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_2, class: ['w-container'], children:[{
        type: 'div', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_3, class: ['w-row'], children:[{
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_4, class: ['w-col', 'w-col-4', 'brand-column'], children:[{
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_5, class: []
          }]
        }, {
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_6, class: ['w-col', 'w-col-8', 'nav-column'], children:[{
            type: 'div', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_7, class: [], children:[{
              type: 'content', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_8, class: []
            }], events: { 'onclick': com.helpfulsidekick.chaddy.Navbar._handleEvent_1 }
          }, {
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar._templateNode_9, class: []
          }]
        }]
      }]
    }]
};

renderTree(doc, body, card, tree);
console.log(body.innerHTML);
