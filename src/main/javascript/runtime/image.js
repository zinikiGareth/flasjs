import FLObject from "./object.js";
import { ResponseWithMessages } from "./messages.js";

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

Image._ctor_uri = function(_cxt, _card, _uri) {
    const ret = new Image(_cxt, _uri);
    return new ResponseWithMessages(_cxt, ret, []);
}
Image._ctor_uri.nfargs = function() { return 2; }

Image.prototype.getUri = function() {
	var uri = this.state.get("uri");
    if (uri instanceof FLURI)
        uri = uri.resolve(window.location);
    return uri;
}
Image.prototype._compare = function(_cxt, other) {
    if (!(other instanceof Image))
        return false;
    return this.state.get("uri").toString() == other.state.get("uri").toString();
}

Image.prototype.toString = function() {
    return "Image " + this.state.get("uri");
}

export { Image };