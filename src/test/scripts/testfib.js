var fs = require('fs');
var vm = require('vm');
var FLEval = vm.runInThisContext(fs.readFileSync('../javascript/flenv.js', 'utf8'));
var fib = vm.runInThisContext(fs.readFileSync('../javascript/fib.js', 'utf8'));

for (var i=0;i<10;i++)
	console.log(FLEval.head(fib(i)));