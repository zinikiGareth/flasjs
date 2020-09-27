const FLObject = require("./object");
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

Crobag.prototype._methods = function() {
    return {
        "add": Crobag.prototype.add
    };
}

//--EXPORTS
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
    module.exports = { Crobag };
} else {
    window.Crobag = Crobag;
}