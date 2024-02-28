import FLObject from "./object";
import { ResponseWithMessages } from "./messages";
import FLError from "./error";

const Html = function(_cxt, _html) {
    FLObject.call(this, _cxt);
    this.state = _cxt.fields();
	this.state.set("html", _html);
}

Html._ctor_from = function(_cxt, _card, _html) {
    var ret;
    if (!(_html instanceof AjaxMessage)) {
        ret = new FLError("not an AjaxMessage");
    } else {
        ret = new Html(_cxt, _html.state.get('body'));
    }
    return new ResponseWithMessages(_cxt, ret, []);
}
Html._ctor_from.nfargs = function() { return 2; }

Html.prototype._compare = function(_cxt, other) {
    if (!(other instanceof Html))
        return false;
    return this.state.get("html").toString() == other.state.get("html").toString();
}

Html.prototype.toString = function() {
    return "Html";
}

export { Html };
