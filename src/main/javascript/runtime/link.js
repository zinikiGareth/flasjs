
//--REQUIRE

const Link = function(_cxt) {
    this.state = _cxt.fields();
    this.state.set('_type', 'Link');
}

Link._typename = 'Link'

Link.prototype._areYouA = function(_cxt, ty) {
  if (_cxt.isTruthy(ty == 'Link')) {
    return true;
  } else 
    return false;
}
Link.prototype._areYouA.nfargs = function() { return 1; }

Link.eval = function(_cxt, _uri, _title) {
    var v1 = new Link(_cxt);
	v1.state.set("uri", _uri);
	v1.state.set("title", _title);
    return v1;
}
Link.eval.nfargs = function() { return 2; }

Link.prototype._field_title = function(_cxt) {
    return this.state.get('title');
}
Link.prototype._field_title.nfargs = function() { return 0; }
  
Link.prototype._field_uri = function(_cxt) {
    return this.state.get('uri');
}
Link.prototype._field_uri.nfargs = function() { return 0; }
  

//--EXPORTS
/* istanbul ignore else */
if (typeof(module) !== 'undefined') {
    module.exports = { Link };
} else {
    window.Link = Link;
}