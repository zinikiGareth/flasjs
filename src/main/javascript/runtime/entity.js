var Entity = function() {
}

Entity.prototype._field_id = function(cx, args) {
  return this.state.get('_id');
}

Entity.prototype._field_id.nfargs = function() {
  return 0;
}

export { Entity };