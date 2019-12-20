// TODO: this should be in something different from runner, I think
// Probably we should have a "runner" module, and then something that imports all that and binds it onto Window
// Or use the same "export" technique we do elsewhere ...
// But console.log is JUST for the Java case
/*
window.console = {};
window.console.log = function() {
	var ret = '';
	var sep = '';
	for (var i=0;i<arguments.length;i++) {
		ret += sep + arguments[i];
		sep = ' ';
	}
	callJava.log(ret);
};
*/
