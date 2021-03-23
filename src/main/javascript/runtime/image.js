const FLObject = require("./object");
const { IdempotentHandler } = require('../../resources/ziwsh');
const { ResponseWithMessages } = require("./messages");
//--REQUIRE

const Image = function(_cxt, _uri) {
    FLObject.call(this, _cxt);
    this.state = _cxt.fields();
	this.state.set("uri", _uri);
}

Image._ctor_asset = function(_cxt, _card, _uri) {
    const ret = new Image(_cxt, _uri);
    return new ResponseWithMessages(_cxt, ret, []);
}
Image._ctor_asset.nfargs = function() { return 2; }

Image.prototype.getUri = function() {
	return this.state.get("uri");
}

//--EXPORTS
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
    module.exports = { Image };
} else {
    window.Image = Image;
}