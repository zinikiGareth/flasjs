var f = function(x) {
  var g = function(y) {
    return x*y;
  }
  return g(2);
}

console.log(f(3));
