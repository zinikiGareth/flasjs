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
  this.contracts['org.ziniki.Init'] = com.helpfulsidekick.chaddy.Navbar._C0.apply(this);
}

com.helpfulsidekick.chaddy.Navbar.__C0 = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.Navbar._C0';
  this._card = v0;
  this._special = 'contract';
  this._contract = 'org.ziniki.Init';
  this._onchan = null;
}

com.helpfulsidekick.chaddy.Navbar._C0 = function() {
  "use strict";
  return new com.helpfulsidekick.chaddy.Navbar.__C0(this);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_7 = function() {
  "use strict";
  return 'Chaddy';
}

com.helpfulsidekick.chaddy.Navbar.__C0.prototype.load = function(v0) {
  "use strict";
  return Nil;
}

com.helpfulsidekick.chaddy.Navbar.prototype.stringFor = function(v0, v1, v2) {
  "use strict";
  v0 = FLEval.head(v0);
  if (v0 instanceof FLError) {
    return v0;
}
  if (typeof v0 === 'boolean') {
    if (v0 === true) {
      return v1;
}
    if (v0 === false) {
      return v2;
}
}
  return FLEval.error("com.helpfulsidekick.chaddy.Navbar.stringFor: case not handled");
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
  var v2 = FLEval.closure(FLEval.tuple, 'src', '../images/chaddy.jpg');
  var v3 = FLEval.closure(Cons, v2, Nil);
  var v4 = FLEval.closure(Cons, v1, v3);
  var v5 = FLEval.closure(Cons, v0, v4);
  return FLEval.closure(DOM.Element, 'img', v5, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_6 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'company');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_8 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-col w-col-8 nav-column');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'nav', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype.switchTo = function(v0, v1) {
  "use strict";
  var v2 = FLEval.closure(Assign, 'currentTab', v0);
  return FLEval.closure(Cons, v2, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype.selectedTab = function(v0) {
  "use strict";
  var v1 = FLEval.closure(FLEval.compeq, v0, this.currentTab);
  return FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.stringFor, v1, 'selected-tab', '');
}

com.helpfulsidekick.chaddy.Navbar.prototype.navItem = function(v0, v1, v2) {
  "use strict";
  var v3 = FLEval.closure(FLEval.tuple, 'title', v0);
  var v4 = FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.selectedTab, v2);
  var v5 = FLEval.closure(Cons, v4, Nil);
  var v6 = FLEval.closure(Cons, 'nav-link ', v5);
  var v7 = FLEval.closure(concat, v6);
  var v8 = FLEval.closure(FLEval.tuple, 'class', v7);
  var v9 = FLEval.closure(Cons, v8, Nil);
  var v10 = FLEval.closure(Cons, v3, v9);
  var v11 = FLEval.closure(Cons, v1, Nil);
  var v12 = FLEval.closure(FLEval.curry, com.helpfulsidekick.chaddy.Navbar.prototype.switchTo, 2, v2);
  var v13 = FLEval.closure(FLEval.tuple, 'click', v12);
  var v14 = FLEval.closure(Cons, v13, Nil);
  return FLEval.closure(DOM.Element, 'a', v10, v11, v14);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_10 = function() {
  "use strict";
  return FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.navItem, 'my queues', 'Q', 'myqueues');
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_11 = function() {
  "use strict";
  return FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.navItem, 'teams', 'T', 'organization and teams');
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_9 = function() {
  "use strict";
  return FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.navItem, 'dashboard', 'D', 'dashboard');
}

com.helpfulsidekick.chaddy.Navbar.template = {
  type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_1, class: ['nav-bar'], children: [{
    type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_2, class: ['w-container'], children: [{
      type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_3, class: ['w-row'], children: [{
        type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_4, class: ['w-col', 'w-col-4', 'brand-column'], children: [{
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_5, class: ['logo']
        }, {
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_6, class: ['company'], children: [{
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_7, class: []
          }]
        }]
      }, {
        type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_8, class: ['w-col', 'w-col-8', 'nav-column'], children: [{
          type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_9, class: []
        }, {
          type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_10, class: []
        }, {
          type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_11, class: []
        }]
      }]
    }]
  }]
};

com.helpfulsidekick.chaddy;
