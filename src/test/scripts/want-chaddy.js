com = function() {
}

com.helpfulsidekick = function() {
}

com.helpfulsidekick.chaddy = function() {
}

com.helpfulsidekick.chaddy.Navbar = function(v0) {
  "use strict";
  var _self = this;
  this._ctor = 'com.helpfulsidekick.chaddy.Navbar';
  this._wrapper = v0.wrapper;
  this._special = 'card';
  this.currentTab = undefined;
  this.contracts = {};
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_8 = function() {
  "use strict";
  return 'D';
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_1 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'nav-bar');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'header', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_2 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-container');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_3 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-row');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_4 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-col w-col-4 brand-column');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_5 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'logo');
  var v1 = FLEval.closure(FLEval.tuple, 'width', '32');
  var v2 = FLEval.closure(FLEval.tuple, 'src', 'chaddy.jpg');
  var v3 = FLEval.closure(Cons, v2, Nil);
  var v4 = FLEval.closure(Cons, v1, v3);
  var v5 = FLEval.closure(Cons, v0, v4);
  return FLEval.closure(DOM.Element, 'image', v5, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_6 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-col w-col-8 nav-column');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'nav', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype.switchTo = function(v0, v1) {
  "use strict";
  console.log("switchTo", v0, v1);
  var v2 = FLEval.closure(Assign, 'currentTab', v0);
  return FLEval.closure(Cons, v2, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_7 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'nav-link current-link');
  var v1 = FLEval.closure(FLEval.tuple, 'title', 'dashboard');
  var v2 = FLEval.closure(Cons, v1, Nil);
  var v3 = FLEval.closure(Cons, v0, v2);
  var v4 = FLEval.closure(FLEval.curry, com.helpfulsidekick.chaddy.Navbar.prototype.switchTo, 2, 'dashboard');
  var v5 = FLEval.closure(FLEval.tuple, 'click', v4);
  var v6 = FLEval.closure(Cons, v5, Nil);
  return FLEval.closure(DOM.Element, 'a', v3, Nil, v6);
}

com.helpfulsidekick.chaddy.Navbar.prototype.navItem = function(v0, v1, v2) {
  "use strict";
  var v3 = FLEval.closure(FLEval.tuple, 'title', v0);
  var v4 = FLEval.closure(FLEval.tuple, 'class', 'nav-link');
  var v5 = FLEval.closure(Cons, v4, Nil);
  var v6 = FLEval.closure(Cons, v3, v5);
  var v7 = FLEval.closure(Cons, v1, Nil);
  var v8 = FLEval.closure(FLEval.curry, com.helpfulsidekick.chaddy.Navbar.prototype.switchTo, 2, v2);
  var v9 = FLEval.closure(FLEval.tuple, 'click', v8);
  var v10 = FLEval.closure(Cons, v9, Nil);
  return FLEval.closure(DOM.Element, 'a', v6, v7, v10);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_9 = function() {
  "use strict";
  return FLEval.oclosure(this._card, com.helpfulsidekick.chaddy.Navbar.prototype.navItem, 'dashboard', 'D', 'dashboard');
}

com.helpfulsidekick.chaddy.Navbar.template = {
  type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_1, class: ['nav-bar'], children: [{
    type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_2, class: ['w-container'], children: [{
      type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_3, class: ['w-row'], children: [{
        type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_4, class: ['w-col', 'w-col-4', 'brand-column'], children: [{
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_5, class: ['logo']
        }]
      }, {
        type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_6, class: ['w-col', 'w-col-8', 'nav-column'], children: [{
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_7, class: ['nav-link', 'current-link'], children: [{
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_8, class: []
          }]
        }, {
          type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_9, class: []
        }]
      }]
    }]
  }]
};

com.helpfulsidekick.chaddy;
