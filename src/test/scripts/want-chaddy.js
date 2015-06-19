com = function() {
}

com.helpfulsidekick = function() {
}

com.helpfulsidekick.chaddy = function() {
}

com.helpfulsidekick.chaddy.Dashboard = function(v0) {
  "use strict";
  var _self = this;
  this._ctor = 'com.helpfulsidekick.chaddy.Dashboard';
  this._wrapper = v0.wrapper;
  this._special = 'card';
  this._services = {};
  this._contracts = {};
}

com.helpfulsidekick.chaddy.Main = function(v0) {
  "use strict";
  var _self = this;
  this._ctor = 'com.helpfulsidekick.chaddy.Main';
  this._wrapper = v0.wrapper;
  this._special = 'card';
  this.cardShowing = "myqueues";
  this._services = {};
  this._services['com.helpfulsidekick.chaddy.TabChanger'] = com.helpfulsidekick.chaddy.Main._S0.apply(this);
  this.changer = this._services['com.helpfulsidekick.chaddy.TabChanger'];
  this._contracts = {};
}

com.helpfulsidekick.chaddy.MyQueues = function(v0) {
  "use strict";
  var _self = this;
  this._ctor = 'com.helpfulsidekick.chaddy.MyQueues';
  this._wrapper = v0.wrapper;
  this._special = 'card';
  var v0 = FLEval.closure(Cons, 'Chaddy Bugs', Nil);
  var v1 = FLEval.closure(Cons, 'Flasck Issues', v0);
  var v2 = FLEval.closure(Cons, 'This Week', v1);
  var v3 = FLEval.closure(Cons, 'TODO Today', v2);
  this.queues = FLEval.closure(Cons, 'Captured Items', v3);
  var v0 = FLEval.closure(Cons, 'List Elements', Nil);
  var v1 = FLEval.closure(Cons, 'Multiple Cards', v0);
  this.items = FLEval.closure(Cons, 'Get Chaddy working', v1);
  this._services = {};
  this._contracts = {};
}

com.helpfulsidekick.chaddy.Navbar = function(v0) {
  "use strict";
  var _self = this;
  this._ctor = 'com.helpfulsidekick.chaddy.Navbar';
  this._wrapper = v0.wrapper;
  this._special = 'card';
  this.currentTab = "myqueues";
  this._services = {};
  this._contracts = {};
  this._contracts['com.helpfulsidekick.chaddy.TabChanger'] = com.helpfulsidekick.chaddy.Navbar._C0.apply(this);
  this.changer = this._contracts['com.helpfulsidekick.chaddy.TabChanger'];
}

com.helpfulsidekick.chaddy.Navbar.__C0 = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.Navbar._C0';
  this._card = v0;
  this._special = 'contract';
  this._contract = 'com.helpfulsidekick.chaddy.TabChanger';
}

com.helpfulsidekick.chaddy.Navbar._C0 = function() {
  "use strict";
  return new com.helpfulsidekick.chaddy.Navbar.__C0(this);
}

com.helpfulsidekick.chaddy.Main.__S0 = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.Main._S0';
  this._card = v0;
  this._special = 'service';
  this._contract = 'com.helpfulsidekick.chaddy.TabChanger';
}

com.helpfulsidekick.chaddy.Main._S0 = function() {
  "use strict";
  return new com.helpfulsidekick.chaddy.Main.__S0(this);
}

com.helpfulsidekick.chaddy.Main.prototype._templateNode_3 = function() {
  "use strict";
  return this.cardShowing;
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_10 = function() {
  "use strict";
  return 'D';
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_12 = function() {
  "use strict";
  return 'Q';
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_14 = function() {
  "use strict";
  return 'T';
}

com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_5 = function() {
  "use strict";
  return 'This probably should be some kind of dashboard.';
}

com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_6 = function() {
  "use strict";
  return 'A summary of active items, new items, teams, messages, etc.';
}

com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_7 = function() {
  "use strict";
  return 'On top of that, I want cards here that can respond to user input and configure themselves.';
}

com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_8 = function() {
  "use strict";
  return 'It would also be good to be able to have them configure notifcations and the like if possible.';
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_10 = function() {
  "use strict";
  return this.items;
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_12 = function() {
  "use strict";
  return this._wrapper.renderState['i'];
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_5 = function() {
  "use strict";
  return this.queues;
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_7 = function() {
  "use strict";
  return this._wrapper.renderState['q'];
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_7 = function() {
  "use strict";
  return 'Chaddy';
}

com.helpfulsidekick.chaddy.Main.prototype._templateNode_4 = function(v0) {
  "use strict";
  return FLEval.closure(FLEval.compeq, v0, 'dashboard');
}

com.helpfulsidekick.chaddy.Main.prototype._templateNode_6 = function(v0) {
  "use strict";
  return FLEval.closure(FLEval.compeq, v0, 'myqueues');
}

com.helpfulsidekick.chaddy.Navbar.prototype.stringFor = function(v0, v1, v2) {
  "use strict";
  v0 = FLEval.head(v0);
  if (v0 instanceof FLError) {
    return v0;
  }
  if (typeof v0 === 'boolean') {
    if (v0 === false) {
      return v2;
    }
    if (v0 === true) {
      return v1;
    }
  }
  return FLEval.error("com.helpfulsidekick.chaddy.Navbar.stringFor: case not handled");
}

com.helpfulsidekick.chaddy.Main.prototype._templateNode_1 = function() {
  "use strict";
  return FLEval.closure(DOM.Element, 'div', Nil, Nil, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_4 = function() {
  "use strict";
  return FLEval.closure(DOM.Element, 'ul', Nil, Nil, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_9 = function() {
  "use strict";
  return FLEval.closure(DOM.Element, 'ul', Nil, Nil, Nil);
}

com.helpfulsidekick.chaddy.Main.prototype._templateNode_2 = function() {
  "use strict";
  var v0 = FLEval.closure(DOM.Element, 'div', Nil, Nil, Nil);
  return FLEval.closure(CreateCard, com.helpfulsidekick.chaddy.Navbar, v0, Nil);
}

com.helpfulsidekick.chaddy.Main.prototype._templateNode_7 = function() {
  "use strict";
  var v0 = FLEval.closure(DOM.Element, 'div', Nil, Nil, Nil);
  return FLEval.closure(CreateCard, com.helpfulsidekick.chaddy.MyQueues, v0, Nil);
}

com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_1 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'section main');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_2 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-row');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_3 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-col w-col-3');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_4 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-col w-col-6');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_11 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'queue-list-item');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_1 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'section main');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_2 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-row');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_3 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-col w-col-3');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_6 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'queue-item');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_8 = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.tuple, 'class', 'w-col w-col-9');
  var v1 = FLEval.closure(Cons, v0, Nil);
  return FLEval.closure(DOM.Element, 'div', v1, Nil, Nil);
}

com.helpfulsidekick.chaddy.Main.__S0.prototype.change = function(v0) {
  "use strict";
  var v1 = FLEval.closure(Assign, 'cardShowing', v0);
  return FLEval.closure(Cons, v1, Nil);
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

com.helpfulsidekick.chaddy.Main.prototype._templateNode_5 = function() {
  "use strict";
  var v0 = FLEval.closure(DOM.Element, 'div', Nil, Nil, Nil);
  return FLEval.closure(CreateCard, com.helpfulsidekick.chaddy.Dashboard, v0, Nil);
}

com.helpfulsidekick.chaddy.Navbar.__C0.prototype.changed = function(v0) {
  "use strict";
  var v1 = FLEval.closure(Assign, 'currentTab', v0);
  return FLEval.closure(Cons, v1, Nil);
}

com.helpfulsidekick.chaddy.Navbar.prototype.selectedTab = function(v0) {
  "use strict";
  var v1 = FLEval.closure(FLEval.compeq, v0, this.currentTab);
  return FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.stringFor, v1, 'selected-tab', '');
}

com.helpfulsidekick.chaddy.Navbar.prototype.switchTo = function(v0, v1) {
  "use strict";
  var v2 = FLEval.closure(Assign, 'currentTab', v0);
  var v3 = FLEval.closure(Cons, v0, Nil);
  var v4 = FLEval.closure(Send, this.changer, 'change', v3);
  var v5 = FLEval.closure(Cons, v4, Nil);
  return FLEval.closure(Cons, v2, v5);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_9 = function() {
  "use strict";
  var v0 = FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.selectedTab, 'dashboard');
  var v1 = FLEval.closure(Nil);
  var v2 = FLEval.closure(Cons, v0, v1);
  var v3 = FLEval.closure(Cons, 'nav-link', v2);
  var v4 = FLEval.closure(join, v3, ' ');
  var v5 = FLEval.closure(FLEval.tuple, 'class', v4);
  var v6 = FLEval.closure(FLEval.tuple, 'title', 'dashboard');
  var v7 = FLEval.closure(Cons, v6, Nil);
  var v8 = FLEval.closure(Cons, v5, v7);
  var v9 = FLEval.closure(FLEval.curry, com.helpfulsidekick.chaddy.Navbar.prototype.switchTo, 2, 'dashboard');
  var v10 = FLEval.closure(FLEval.tuple, 'click', v9);
  var v11 = FLEval.closure(Cons, v10, Nil);
  return FLEval.closure(DOM.Element, 'a', v8, Nil, v11);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_11 = function() {
  "use strict";
  var v0 = FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.selectedTab, 'myqueues');
  var v1 = FLEval.closure(Nil);
  var v2 = FLEval.closure(Cons, v0, v1);
  var v3 = FLEval.closure(Cons, 'nav-link', v2);
  var v4 = FLEval.closure(join, v3, ' ');
  var v5 = FLEval.closure(FLEval.tuple, 'class', v4);
  var v6 = FLEval.closure(FLEval.tuple, 'title', 'my queues');
  var v7 = FLEval.closure(Cons, v6, Nil);
  var v8 = FLEval.closure(Cons, v5, v7);
  var v9 = FLEval.closure(FLEval.curry, com.helpfulsidekick.chaddy.Navbar.prototype.switchTo, 2, 'myqueues');
  var v10 = FLEval.closure(FLEval.tuple, 'click', v9);
  var v11 = FLEval.closure(Cons, v10, Nil);
  return FLEval.closure(DOM.Element, 'a', v8, Nil, v11);
}

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_13 = function() {
  "use strict";
  var v0 = FLEval.oclosure(this, com.helpfulsidekick.chaddy.Navbar.prototype.selectedTab, 'teams');
  var v1 = FLEval.closure(Nil);
  var v2 = FLEval.closure(Cons, v0, v1);
  var v3 = FLEval.closure(Cons, 'nav-link', v2);
  var v4 = FLEval.closure(join, v3, ' ');
  var v5 = FLEval.closure(FLEval.tuple, 'class', v4);
  var v6 = FLEval.closure(FLEval.tuple, 'title', 'organization and teams');
  var v7 = FLEval.closure(Cons, v6, Nil);
  var v8 = FLEval.closure(Cons, v5, v7);
  var v9 = FLEval.closure(FLEval.curry, com.helpfulsidekick.chaddy.Navbar.prototype.switchTo, 2, 'teams');
  var v10 = FLEval.closure(FLEval.tuple, 'click', v9);
  var v11 = FLEval.closure(Cons, v10, Nil);
  return FLEval.closure(DOM.Element, 'a', v8, Nil, v11);
}

com.helpfulsidekick.chaddy.Dashboard.template = {
  type: 'div', fn: com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_1, route: '', children: [{
    type: 'div', fn: com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_2, route: '0', children: [{
      type: 'div', fn: com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_3, route: '0.0'
    }, {
      type: 'div', fn: com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_4, route: '0.1', children: [{
        type: 'content', fn: com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_5, route: '0.1.0'
      }, {
        type: 'content', fn: com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_6, route: '0.1.1'
      }, {
        type: 'content', fn: com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_7, route: '0.1.2'
      }, {
        type: 'content', fn: com.helpfulsidekick.chaddy.Dashboard.prototype._templateNode_8, route: '0.1.3'
      }]
    }]
  }]
};

com.helpfulsidekick.chaddy.Main.template = {
  type: 'div', fn: com.helpfulsidekick.chaddy.Main.prototype._templateNode_1, route: '', children: [{
    type: 'card', fn: com.helpfulsidekick.chaddy.Main.prototype._templateNode_2, route: '0'
  }, {
    type: 'switch', val: com.helpfulsidekick.chaddy.Main.prototype._templateNode_3, route: '1', children: [{
      type: 'case', val: com.helpfulsidekick.chaddy.Main.prototype._templateNode_4, route: '1.0', children: [{
        type: 'card', fn: com.helpfulsidekick.chaddy.Main.prototype._templateNode_5, route: '1.0.0'
      }]
    }, {
      type: 'case', val: com.helpfulsidekick.chaddy.Main.prototype._templateNode_6, route: '1.1', children: [{
        type: 'card', fn: com.helpfulsidekick.chaddy.Main.prototype._templateNode_7, route: '1.1.0'
      }]
    }]
  }]
};

com.helpfulsidekick.chaddy.MyQueues.template = {
  type: 'div', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_1, route: '', children: [{
    type: 'div', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_2, route: '0', children: [{
      type: 'div', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_3, route: '0.0', children: [{
        type: 'list', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_4, var: 'q', val: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_5, route: '0.0.0', children: [{
          type: 'div', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_6, route: '0.0.0.0', children: [{
            type: 'content', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_7, route: '0.0.0.0.0'
          }]
        }]
      }]
    }, {
      type: 'div', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_8, route: '0.1', children: [{
        type: 'list', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_9, var: 'i', val: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_10, route: '0.1.0', children: [{
          type: 'div', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_11, route: '0.1.0.0', children: [{
            type: 'content', fn: com.helpfulsidekick.chaddy.MyQueues.prototype._templateNode_12, route: '0.1.0.0.0'
          }]
        }]
      }]
    }]
  }]
};

com.helpfulsidekick.chaddy.Navbar.template = {
  type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_1, route: '', children: [{
    type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_2, route: '0', children: [{
      type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_3, route: '0.0', children: [{
        type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_4, route: '0.0.0', children: [{
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_5, route: '0.0.0.0'
        }, {
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_6, route: '0.0.0.1', children: [{
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_7, route: '0.0.0.1.0'
          }]
        }]
      }, {
        type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_8, route: '0.0.1', children: [{
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_9, route: '0.0.1.0', children: [{
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_10, route: '0.0.1.0.0'
          }]
        }, {
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_11, route: '0.0.1.1', children: [{
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_12, route: '0.0.1.1.0'
          }]
        }, {
          type: 'div', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_13, route: '0.0.1.2', children: [{
            type: 'content', fn: com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_14, route: '0.0.1.2.0'
          }]
        }]
      }]
    }]
  }]
};

com.helpfulsidekick.chaddy.Dashboard.updates = {
};

com.helpfulsidekick.chaddy.Main.updates = {
  cardShowing: [{
    route: '1', node: com.helpfulsidekick.chaddy.Main.template.children[1], action: 'renderChildren'
  }]
};

com.helpfulsidekick.chaddy.MyQueues.updates = {
  items: [{
    route: '0.1.0', node: com.helpfulsidekick.chaddy.MyQueues.template.children[0].children[1].children[0], action: 'render'
  }],
  queues: [{
    route: '0.0.0', node: com.helpfulsidekick.chaddy.MyQueues.template.children[0].children[0].children[0], action: 'render'
  }]
};

com.helpfulsidekick.chaddy.Navbar.updates = {
  currentTab: [{
    route: '0.0.1.0', node: com.helpfulsidekick.chaddy.Navbar.template.children[0].children[0].children[1].children[0], action: 'attrs'
  }, {
    route: '0.0.1.1', node: com.helpfulsidekick.chaddy.Navbar.template.children[0].children[0].children[1].children[1], action: 'attrs'
  }, {
    route: '0.0.1.2', node: com.helpfulsidekick.chaddy.Navbar.template.children[0].children[0].children[1].children[2], action: 'attrs'
  }]
};

com.helpfulsidekick.chaddy;
