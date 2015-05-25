var fs = require('fs');
var vm = require('vm');

// read in the FL environment and the (new) standard library
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
var stdlib = vm.runInThisContext(fs.readFileSync('../javascript/stdlib.js', 'utf8'));

Cons = 'cons';
Nil = 'nil';

// read in the compiled "take" function
var stdlib = vm.runInThisContext(fs.readFileSync('../../../../../FLAS2/src/test/resources/take.js', 'utf8'));


// read the primes code
var primes = vm.runInThisContext(fs.readFileSync('../javascript/primes.js', 'utf8'));

// calculate the first few primes
var test = take(7, primes());

// traverse the list printing "cons.head"
for (x = FLEval.full(test); x._ctor === 'cons'; x = x.tail)
	console.log(x.head);