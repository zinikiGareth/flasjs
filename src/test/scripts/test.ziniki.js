test = function() {
}

test.ziniki = function() {
}

test.ziniki._CounterObj = function(v0) {
  "use strict";
  this._ctor = 'test.ziniki.CounterObj';
  if (v0) {
    if (v0.inc) {
      this.inc = v0.inc;
    }
    else {
      this.inc = 0;
    }
  }
  else {
    this.inc = 0;
  }
}

test.ziniki.CounterObj = function(v0) {
  "use strict";
  return new test.ziniki._CounterObj({inc: v0});
}

test.ziniki.CounterCard = function(v0) {
  "use strict";
  var _self = this;
  this._ctor = 'test.ziniki.CounterCard';
  this._wrapper = v0.wrapper;
  this._special = 'card';
  this.t = undefined;
  this.counter = 0;
  this._services = {};
  this._contracts = {};
  this._contracts['org.ziniki.KeyValue'] = test.ziniki.CounterCard._C0.apply(this);
  this._contracts['test.ziniki.Timer'] = test.ziniki.CounterCard._C1.apply(this);
  this.timer = this._contracts['test.ziniki.Timer'];
}

test.ziniki.CounterCard.__C0 = function(v0) {
  "use strict";
  this._ctor = 'test.ziniki.CounterCard._C0';
  this._card = v0;
  this._special = 'contract';
  this._contract = 'org.ziniki.KeyValue';
}

test.ziniki.CounterCard._C0 = function() {
  "use strict";
  return new test.ziniki.CounterCard.__C0(this);
}

test.ziniki.CounterCard.__C1 = function(v0) {
  "use strict";
  this._ctor = 'test.ziniki.CounterCard._C1';
  this._card = v0;
  this._special = 'contract';
  this._contract = 'test.ziniki.Timer';
}

test.ziniki.CounterCard._C1 = function() {
  "use strict";
  return new test.ziniki.CounterCard.__C1(this);
}

test.ziniki.CounterCard._CountUp = function(v0, v1) {
  "use strict";
  this._ctor = 'test.ziniki.CounterCard.CountUp';
  this._card = v0;
  this._special = 'handler';
  this._contract = 'test.ziniki.OnCounter';
  this.inc = v1;
}

test.ziniki.CounterCard.CountUp = function(v0) {
  "use strict";
  return new test.ziniki.CounterCard._CountUp(this, v0);
}

test.ziniki.CounterCard._CountUp.prototype.onTick = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.plus, this._card.counter, this.inc);
  var v1 = FLEval.closure(Assign, 'counter', v0);
  return FLEval.closure(Cons, v1, Nil);
}

test.ziniki.CounterCard.__C0.prototype.value = function(v0) {
  "use strict";
  v0 = FLEval.head(v0);
  if (v0 instanceof FLError) {
    return v0;
  }
  if (v0 && v0._ctor == 'test.ziniki.CounterObj') {
    var v1 = FLEval.closure(FLEval.field, v0, 'inc');
    var v2 = FLEval.oclosure(this._card, test.ziniki.CounterCard.CountUp, v1);
    var v3 = FLEval.closure(Cons, 1000, Nil);
    var v4 = FLEval.closure(Cons, v2, v3);
    var v5 = FLEval.closure(Send, 'timer', 'requestTicks', v4);
    return FLEval.closure(Cons, v5, Nil);
  }
  return FLEval.error("test.ziniki.CounterCard._C0.value: case not handled");
}

var hackid = 0;
test.ziniki.CounterCard.initialRender = function(doc, wrapper, parent, card) {
	card._struct_1(doc, wrapper, parent);
	card._content_2(doc, wrapper);
};

test.ziniki.CounterCard.prototype._struct_1 = function(doc, wrapper, parent) {
	var sid1 = 'sid_' + (++hackid);
	var span = doc.createElement('span');
	span.setAttribute('id', sid1);
	parent.appendChild(span);
	wrapper.infoAbout['struct_1'] = { sid1: sid1 };
}

test.ziniki.CounterCard.prototype._content_2 = function(doc, wrapper) {
	var span = doc.getElementById(wrapper.infoAbout['struct_1']['sid1']);
	span.innerHTML = '';
	var te = doc.createTextNode(this.counter);
	span.appendChild(te);
}

test.ziniki.CounterCard.onUpdate = {
  'counter': {
    assign: [ test.ziniki.CounterCard.prototype._content_2 ]
  }
};

test.ziniki;
