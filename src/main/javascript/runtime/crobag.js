const FLObject = require("./object");
const { IdempotentHandler } = require('../../resources/ziwsh');
const { ResponseWithMessages } = require("./messages");
//--REQUIRE

const Crobag = function(_cxt, _card) {
    FLObject.call(this, _cxt);
    this._card = _card;
    this.state = _cxt.fields();
}

Crobag._ctor_new = function(_cxt, _card) {
    const ret = new Crobag(_cxt, _card);
    return new ResponseWithMessages(_cxt, ret, []);
}
Crobag._ctor_new.nfargs = function() { return 1; }

Crobag.prototype.add = function(_cxt, key, val) {
    return [];
}
Crobag.prototype.add.nfargs = function() { return 1; }

Crobag.prototype.window = function(_cxt, from, size, handler) {
    return [];
}
Crobag.prototype.window.nfargs = function() { return 3; }

Crobag.prototype._methods = function() {
    return {
        "add": Crobag.prototype.add,
        "window": Crobag.prototype.window
    };
}

CrobagWindow = function(_cxt) {
    IdempotentHandler.call(this, _cxt);
    return ;
}
CrobagWindow.prototype = new IdempotentHandler();
CrobagWindow.prototype.constructor = CrobagWindow;

CrobagWindow.prototype.name = function() {
    return 'CrobagWindow';
}

CrobagWindow.prototype.name.nfargs = function() { return -1; }

CrobagWindow.prototype._methods = function() {
    const v1 = ['success','failure','next'];
    return v1;
}

CrobagWindow.prototype._methods.nfargs = function() { return -1; }

CrobagWindow.prototype.next = function(_cxt, _key, _value, _ih) {
    return 'interface method for CrobagWindow.coming';
}

CrobagWindow.prototype.next.nfargs = function() { return 2; }
  
  
//--EXPORTS
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
    module.exports = { Crobag };
} else {
    window.Crobag = Crobag;
}