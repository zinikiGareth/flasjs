com = function() {
}

com.helpfulsidekick = function() {
}

com.helpfulsidekick.chaddy = function() {
}

com.helpfulsidekick.chaddy._Queue = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.Queue';
  if (v0) {
    if (v0.id) {
      this.id = v0.id;
    }
    if (v0.title) {
      this.title = v0.title;
    }
  }
  else {
  }
}

com.helpfulsidekick.chaddy.Queue = function(v0, v1) {
  "use strict";
  return new com.helpfulsidekick.chaddy._Queue({id: v0, title: v1});
}

com.helpfulsidekick.chaddy._Task = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.Task';
  if (v0) {
    if (v0.id) {
      this.id = v0.id;
    }
    if (v0.desc) {
      this.desc = v0.desc;
    }
  }
  else {
  }
}

com.helpfulsidekick.chaddy.Task = function(v0, v1) {
  "use strict";
  return new com.helpfulsidekick.chaddy._Task({id: v0, desc: v1});
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
  this.queues = FLEval.closure(Croset, Nil);
  this.selectedQueue = undefined;
  this.items = FLEval.closure(Croset, Nil);
  this._services = {};
  this._contracts = {};
  this._contracts['org.ziniki.Init'] = com.helpfulsidekick.chaddy.MyQueues._C0.apply(this);
  this._contracts['org.ziniki.Query'] = com.helpfulsidekick.chaddy.MyQueues._C1.apply(this);
  this.query = this._contracts['org.ziniki.Query'];
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

com.helpfulsidekick.chaddy.MyQueues.__C0 = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.MyQueues._C0';
  this._card = v0;
  this._special = 'contract';
  this._contract = 'org.ziniki.Init';
}

com.helpfulsidekick.chaddy.MyQueues._C0 = function() {
  "use strict";
  return new com.helpfulsidekick.chaddy.MyQueues.__C0(this);
}

com.helpfulsidekick.chaddy.MyQueues.__C1 = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.MyQueues._C1';
  this._card = v0;
  this._special = 'contract';
  this._contract = 'org.ziniki.Query';
}

com.helpfulsidekick.chaddy.MyQueues._C1 = function() {
  "use strict";
  return new com.helpfulsidekick.chaddy.MyQueues.__C1(this);
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

com.helpfulsidekick.chaddy.MyQueues._QueueHandler = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.MyQueues.QueueHandler';
  this._card = v0;
  this._special = 'handler';
  this._contract = 'org.ziniki.QueryHandler';
}

com.helpfulsidekick.chaddy.MyQueues.QueueHandler = function() {
  "use strict";
  return new com.helpfulsidekick.chaddy.MyQueues._QueueHandler(this);
}

com.helpfulsidekick.chaddy.MyQueues._TaskHandler = function(v0) {
  "use strict";
  this._ctor = 'com.helpfulsidekick.chaddy.MyQueues.TaskHandler';
  this._card = v0;
  this._special = 'handler';
  this._contract = 'org.ziniki.QueryHandler';
}

com.helpfulsidekick.chaddy.MyQueues.TaskHandler = function() {
  "use strict";
  return new com.helpfulsidekick.chaddy.MyQueues._TaskHandler(this);
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

com.helpfulsidekick.chaddy.Navbar.prototype._templateNode_7 = function() {
  "use strict";
  return 'Chaddy';
}

com.helpfulsidekick.chaddy.MyQueues.prototype.styleIf = function(v0, v1) {
  "use strict";
  v1 = FLEval.head(v1);
  if (v1 instanceof FLError) {
    return v1;
  }
  if (typeof v1 === 'boolean') {
    if (v1 === true) {
      return v0;
    }
  }
  return '';
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

com.helpfulsidekick.chaddy.Main.__S0.prototype.change = function(v0) {
  "use strict";
  var v1 = FLEval.closure(Assign, 'cardShowing', v0);
  return FLEval.closure(Cons, v1, Nil);
}

com.helpfulsidekick.chaddy.MyQueues.__C0.prototype.onready = function() {
  "use strict";
  var v0 = FLEval.oclosure(this._card, com.helpfulsidekick.chaddy.MyQueues.QueueHandler);
  var v1 = FLEval.closure(Cons, v0, Nil);
  var v2 = FLEval.closure(Cons, 'com.helpfulsidekick.chaddy.Queue', v1);
  var v3 = FLEval.closure(Cons, 'query/com.helpfulsidekick.omt.personal.chaddy.1/personal/myqueues', v2);
  var v4 = FLEval.closure(Send, 'query', 'scan', v3);
  return FLEval.closure(Cons, v4, Nil);
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

com.helpfulsidekick.chaddy.Navbar.__C0.prototype.changed = function(v0) {
  "use strict";
  var v1 = FLEval.closure(Assign, 'currentTab', v0);
  return FLEval.closure(Cons, v1, Nil);
}

com.helpfulsidekick.chaddy.MyQueues._QueueHandler.prototype.entry = function(v0, v1) {
  "use strict";
  v1 = FLEval.head(v1);
  if (v1 instanceof FLError) {
    return v1;
  }
  if (v1 && v1._ctor == 'com.helpfulsidekick.chaddy.Queue') {
    v0 = FLEval.head(v0);
    if (v0 instanceof FLError) {
      return v0;
    }
    if (typeof v0 === 'string') {
      var v2 = FLEval.closure(Cons, v1, Nil);
      var v3 = FLEval.closure(Cons, v0, v2);
      var v4 = FLEval.closure(Send, 'queues', 'insert', v3);
      return FLEval.closure(Cons, v4, Nil);
    }
  }
  return FLEval.error("com.helpfulsidekick.chaddy.MyQueues.QueueHandler.entry: case not handled");
}

com.helpfulsidekick.chaddy.MyQueues._TaskHandler.prototype.entry = function(v0, v1) {
  "use strict";
  v1 = FLEval.head(v1);
  if (v1 instanceof FLError) {
    return v1;
  }
  if (v1 && v1._ctor == 'com.helpfulsidekick.chaddy.Task') {
    v0 = FLEval.head(v0);
    if (v0 instanceof FLError) {
      return v0;
    }
    if (typeof v0 === 'string') {
      var v2 = FLEval.closure(Cons, v1, Nil);
      var v3 = FLEval.closure(Cons, v0, v2);
      var v4 = FLEval.closure(Send, 'items', 'insert', v3);
      return FLEval.closure(Cons, v4, Nil);
    }
  }
  return FLEval.error("com.helpfulsidekick.chaddy.MyQueues.TaskHandler.entry: case not handled");
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
  var v4 = FLEval.closure(Send, 'changer', 'change', v3);
  var v5 = FLEval.closure(Cons, v4, Nil);
  return FLEval.closure(Cons, v2, v5);
}

com.helpfulsidekick.chaddy.MyQueues.prototype.selectQueue = function(v0) {
  "use strict";
  var v1 = FLEval.closure(Assign, 'selectedQueue', v0);
  var v2 = FLEval.closure(Croset, Nil);
  var v3 = FLEval.closure(Assign, 'items', v2);
  var v4 = FLEval.closure(append, 'query/com.helpfulsidekick.omt.personal.chaddy.1/personal/queue/', v0);
  var v5 = FLEval.oclosure(this._card, com.helpfulsidekick.chaddy.MyQueues.TaskHandler);
  var v6 = FLEval.closure(Cons, v5, Nil);
  var v7 = FLEval.closure(Cons, 'com.helpfulsidekick.chaddy.Task', v6);
  var v8 = FLEval.closure(Cons, v4, v7);
  var v9 = FLEval.closure(Send, 'query', 'scan', v8);
  var v10 = FLEval.closure(Cons, v9, Nil);
  var v11 = FLEval.closure(Cons, v3, v10);
  return FLEval.closure(Cons, v1, v11);
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

com.helpfulsidekick.chaddy.Dashboard.initialRender = function(doc, wrapper, parent, card) {
  "use strict";
}

com.helpfulsidekick.chaddy.Dashboard.prototype._struct_1 = function(doc, wrapper, parent) {
  "use strict";
  var block_2 = doc.createElement('div');
}

com.helpfulsidekick.chaddy.Dashboard.onUpdate = {
}

com.helpfulsidekick.chaddy.Main.prototype._initialRender = function(doc, wrapper, parent) {
  "use strict";
	this._struct_1(doc, wrapper, parent);
	this._card_1(doc, wrapper, doc.getElementById(wrapper.infoAbout['sid1']));
	this._switch_1(doc, wrapper, doc.getElementById(wrapper.infoAbout['sid2']));
}

com.helpfulsidekick.chaddy.Main.prototype._struct_1 = function(doc, wrapper, parent) {
  "use strict";
	var block_2 = doc.createElement('div');
	var elt2 = doc.createElement('div');
	var sid1 = wrapper.nextSlotId();
	elt2.setAttribute('id', sid1);
	block_2.appendChild(elt2);
	var sw = doc.createElement('div');
	var sid2 = wrapper.nextSlotId();
	sw.setAttribute('id', sid2);
	block_2.appendChild(sw);
	parent.appendChild(block_2);
	wrapper.infoAbout["sid1"] = sid1;
	wrapper.infoAbout["sid2"] = sid2;
}

com.helpfulsidekick.chaddy.Main.prototype._card_1 = function(doc, wrapper, parent) {
	if (wrapper.cardCache['card_1']) {
   		wrapper.cardCache[tree.route].redrawInto(html);
	} else {
  		var svcs = wrapper.services;
  		var innerCard = Flasck.createCard(wrapper.postbox, parent, { explicit: com.helpfulsidekick.chaddy.Navbar }, svcs);
  		wrapper.cardCache['card_1'] = innerCard;
	}
}

com.helpfulsidekick.chaddy.Main.prototype._switch_1 = function(doc, wrapper, parent) {
	var val = this.cardShowing;
	// TODO: test if it has NOT changed ... and thus do nothing
	parent.innerHTML = null;
	if (val === 'dashboard')
		this._card_2(doc, wrapper, parent);
	else if (val === 'myqueues')
		this._card_3(doc, wrapper, parent);
}

com.helpfulsidekick.chaddy.Main.prototype._card_2 = function(doc, wrapper, parent) {
	if (wrapper.cardCache['card_2']) {
   		wrapper.cardCache[tree.route].redrawInto(html);
	} else {
  		var svcs = wrapper.services;
  		var innerCard = Flasck.createCard(wrapper.postbox, parent, { explicit: com.helpfulsidekick.chaddy.Dashboard }, svcs);
  		wrapper.cardCache['card_2'] = innerCard;
	}
}

com.helpfulsidekick.chaddy.Main.prototype._card_3 = function(doc, wrapper, parent) {
	if (wrapper.cardCache['card_3']) {
   		wrapper.cardCache[tree.route].redrawInto(html);
	} else {
  		var svcs = wrapper.services;
  		var innerCard = Flasck.createCard(wrapper.postbox, parent, { explicit: com.helpfulsidekick.chaddy.MyQueues }, svcs);
  		wrapper.cardCache['card_3'] = innerCard;
	}
}

com.helpfulsidekick.chaddy.MyQueues.prototype._initialRender = function(doc, wrapper, parent) {
	"use strict";
	var block_2 = doc.createElement('div');
	block_2.setAttribute('class', 'section main');
	parent.appendChild(block_2);
	var block_3 = doc.createElement('div');
	block_3.setAttribute('class', 'w-row');
	block_2.appendChild(block_3);
	var block_4 = doc.createElement('div');
	block_4.setAttribute('class', 'w-col w-col-3');
	block_3.appendChild(block_4);
	var block_5 = doc.createElement('ul');
	var sid6 = wrapper.nextSlotId();
	block_5.setAttribute('id', sid6);
	wrapper.infoAbout['sid6'] = sid6;
	block_5.setAttribute('class', 'w-list-unstyled queue-list');
	wrapper.infoAbout['block_5'] = {};
	// TODO: insert any current contents of the CROSET using insertItem
	this._block_5_formatList(doc, wrapper);
	block_4.appendChild(block_5);
	var block_11 = doc.createElement('div');
	block_11.setAttribute('class', 'w-col w-col-9');
	block_3.appendChild(block_11);
	var block_12 = doc.createElement('ul');
	var sid13 = wrapper.nextSlotId();
	block_12.setAttribute('id', sid13);
	wrapper.infoAbout['sid13'] = sid13;
	block_12.setAttribute('class', 'w-list-unstyled');
	wrapper.infoAbout['block_12'] = {};
	// TODO: insert any current contents of the CROSET using insertItem
	this._block_12_formatList(doc, wrapper);
	block_11.appendChild(block_12);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._block_5_itemInserted = function(doc, wrapper, item, before) {
	"use strict";
	var parent = doc.getElementById(wrapper.infoAbout['sid6']);
	wrapper.infoAbout['block_5'][item.id] = { item: item };
	var block_7 = doc.createElement('div');
	var sid8 = wrapper.nextSlotId();
	block_7.setAttribute('id', sid8);
	wrapper.infoAbout['block_5'][item.id]['sid8'] = sid8;
	if (before) {
		parent.insertBefore(block_7, before);
	}
	else {
		parent.appendChild(block_7);
	}
  	var v0 = FLEval.closure(FLEval.field, item, 'id');
	var eh = FLEval.oclosure(this, com.helpfulsidekick.chaddy.MyQueues.prototype.selectQueue, v0);
  	block_7['onclick'] = function(event) {
  		wrapper.dispatchEvent(event, eh);
  	}
	var block_9 = doc.createElement('span');
	var sid10 = wrapper.nextSlotId();
	block_9.setAttribute('id', sid10);
	wrapper.infoAbout['block_5'][item.id]['sid10'] = sid10;
	block_7.appendChild(block_9);
	this._block_5_formatItem(doc, wrapper, wrapper.infoAbout['block_5'][item.id]);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._block_5_itemChanged = function(doc, wrapper, item) {
	"use strict";
	var span = doc.getElementById(wrapper.infoAbout['block_5'][item.id]['sid10']);
	span.innerHTML = '';
	var textContent = FLEval.closure(FLEval.field, item, 'title');
	var text = doc.createTextNode(FLEval.full(textContent));
	span.appendChild(text);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._block_5_formatItem = function(doc, wrapper, info) {
	"use strict";
  	var v0 = FLEval.field(info.item, 'id');
  	var v1 = FLEval.compeq(this.selectedQueue, v0);
  	var v2 = this.styleIf('selected-queue-item', v1);
	var v6 = join(Cons('queue-item', Cons(v2, Nil)), ' ');
	doc.getElementById(info.sid8).setAttribute('class', v6);
}

com.helpfulsidekick.chaddy.MyQueues.prototype._block_5_formatList = function(doc, wrapper) {
	"use strict";
	for (var x in wrapper.infoAbout['block_5']) {
		this._block_5_formatItem(doc, wrapper, wrapper.infoAbout['block_5'][x]);
	}
}

com.helpfulsidekick.chaddy.MyQueues.prototype._block_12_itemInserted = function(doc, wrapper, item, before) {
    "use strict";
    var parent = doc.getElementById(wrapper.infoAbout['sid13']);
    wrapper.infoAbout['block_12'][item.id] = { item: item };
    var block_12 = doc.createElement('div');
    block_12.setAttribute('class', 'queue-list-item');
    if (before) {
        parent.insertBefore(block_12, before);
    }
    else {
        parent.appendChild(block_12);
    }
    var sid6 = wrapper.nextSlotId();
    var span7 = doc.createElement('span');
    span7.setAttribute('id', sid6);
    block_12.appendChild(span7);
    wrapper.infoAbout['block_12'][item.id]['sid6'] = sid6;
    var sid8 = wrapper.nextSlotId();
    var span9 = doc.createElement('span');
    span9.setAttribute('id', sid8);
    block_12.appendChild(span9);
    wrapper.infoAbout['block_12'][item.id]['sid8'] = sid8;
}
  
com.helpfulsidekick.chaddy.MyQueues.prototype._block_12_itemChanged = function(doc, wrapper, item) {
    "use strict";
}

com.helpfulsidekick.chaddy.MyQueues.prototype._block_12_formatItem = function(doc, wrapper, item) {
}

com.helpfulsidekick.chaddy.MyQueues.prototype._block_12_formatList = function(doc, wrapper) {
	for (var x in wrapper.infoAbout['block_12']) {
		this._block_12_formatItem(doc, wrapper, wrapper.infoAbout['block_12'][x]);
	}
}

com.helpfulsidekick.chaddy.MyQueues.onUpdate = {
	"queues": {
		"itemInserted": [ com.helpfulsidekick.chaddy.MyQueues.prototype._block_5_itemInserted ],
		"itemChanged": [ com.helpfulsidekick.chaddy.MyQueues.prototype._block_5_itemChanged ]
	},
	"selectedQueue": {
		"assign": [ com.helpfulsidekick.chaddy.MyQueues.prototype._block_5_formatList ]
	}
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

/*
com.helpfulsidekick.chaddy.Main.updates = {
  cardShowing: [{
    route: '1', node: com.helpfulsidekick.chaddy.Main.template.children[1], action: 'renderChildren'
  }]
};

com.helpfulsidekick.chaddy.MyQueues.updates = {
  items: [{
    route: '0.1.0+i', node: com.helpfulsidekick.chaddy.MyQueues.template.children[0].children[1].children[0].template, action: 'render', list: 'items'
  }],
  queues: [{
    route: '0.0.0+q', node: com.helpfulsidekick.chaddy.MyQueues.template.children[0].children[0].children[0].template, action: 'render', list: 'queues'
  }],
  selectedQueue: [{
    route: '0.0.0+q', node: com.helpfulsidekick.chaddy.MyQueues.template.children[0].children[0].children[0].template, action: 'attrs', list: 'queues'
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
*/

com.helpfulsidekick.chaddy;
