// require standard node stuff
var fs = require('fs');
var assert = require('assert');

// load builtin, removing "use strict"
var text = fs.readFileSync('../../main/javascript/runtime/builtin.js') + '';
var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
text = "";
var re = /"use strict"/;
for (var l in lines) {
  if (re.test(lines[l]))
    continue;
  text += lines[l];
}
eval(text);

// run some tests

// only
var first = Crokey.onlyKey('a1');
assert.equal("C", first.toString());

// end
var d = first.atEnd('a2');
assert.equal("D", d.toString());
e = d.atEnd('a3');
assert.equal("E", e.toString());
var n = new Crokey("n", 'a4');
assert.equal("n", n.toString());
var nP = n.atEnd('a5');
assert.equal("oC", nP.toString());
var nPP = nP.atEnd('a6');
assert.equal("oD", nPP.toString());

// start
var bo = first.atStart('a11');
assert.equal("Bo", bo.toString());
var bn = bo.atStart('a12');
assert.equal("Bn", bn.toString());
var aoo = new Crokey("BC", 'a13').atStart('a14');
assert.equal("Aoo", aoo.toString());
var isc = d.atStart('a15');
assert.equal("C", isc.toString());

// between
var cv = first.before(d, 'a7');
assert.equal("CV", cv.toString());
var cl = first.before(cv, 'a8'); 
assert.equal("CL", cl.toString());
var cq = cl.before(cv, 'a9'); 
assert.equal("CQ", cq.toString());
var cf = cv.before(d, 'a10');
assert.equal("Cf", cf.toString());
