test = function() {
}

test.ziniki = function() {
}

test.ziniki.CounterCard = function(v0) {
  "use strict";
  var _self = this;
  this._ctor = 'test.ziniki.CounterCard';
  this._wrapper = v0.wrapper;
  this._special = 'card';
  this.counter = 0;
  this.contracts = {};
  this.contracts['test.ziniki.Init'] = test.ziniki.CounterCard._C0.apply(this);
  this.contracts['test.ziniki.Timer'] = test.ziniki.CounterCard._C1.apply(this);
  this.timer = this.contracts['test.ziniki.Timer'];
}

test.ziniki.CounterCard.__C0 = function(v0) {
  "use strict";
  this._ctor = 'test.ziniki.CounterCard._C0';
  this._card = v0;
  this._special = 'contract';
  this._contract = 'test.ziniki.Init';
  this._onchan = null;
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
  this._onchan = null;
}

test.ziniki.CounterCard._C1 = function() {
	"use strict";
	return new test.ziniki.CounterCard.__C1(this);
}

test.ziniki.CounterCard.__H0 = function(v0, v1) {
  "use strict";
  this._ctor = 'test.ziniki.CounterCard._H0';
  this._card = v0;
  this._special = 'handler';
  this._contract = 'test.ziniki.OnCounter';
  this._onchan = null;
  this.inc = v1;
}

test.ziniki.CounterCard._H0 = function(v1) {
  "use strict";
  return new test.ziniki.CounterCard.__H0(this, v1);
}

test.ziniki.CounterObj = function(v0) {
  "use strict";
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

test.ziniki.CounterCard.prototype._templateNode_1 = function() {
  "use strict";
  return this.counter;
}

test.ziniki.CounterCard.__H0.prototype.onTick = function() {
  "use strict";
  var v0 = FLEval.closure(FLEval.plus, this._card.counter, this.inc);
  var v1 = FLEval.closure(Assign, 'counter', v0);
  return FLEval.closure(Cons, v1, Nil);
}

test.ziniki.CounterCard.__C0.prototype.load = function(v0) {
  "use strict";
  var v1 = FLEval.closure(FLEval.field, v0, 'inc');
  var v2 = FLEval.oclosure(this._card, test.ziniki.CounterCard._H0, v1);
  var v3 = FLEval.closure(Cons, 1000, Nil);
  var v4 = FLEval.closure(Cons, v2, v3);
  var v5 = FLEval.closure(Send, this._card.timer, 'requestTicks', v4);
  return FLEval.closure(Cons, v5, Nil);
}

test.ziniki;
