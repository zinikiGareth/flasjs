function FLASImporter() {
	this.needs = [];
	this.table = {};
	this.modules = {};
	require.importer = this;
}

FLASImporter.prototype.js = function(name) {
	this.needs.push(name);
	return this;
}

FLASImporter.prototype.execute = function() {
	var self = this;

	if (this.needs.length == 0) {
		return;
	}

	var s = this.needs.shift();
	console.log("load", s);
	import(s).then(mod => {
		var key = s.substring(s.lastIndexOf('/')+1).replace(".js", "");
		this.table[key] = mod;
		var keys = Object.keys(mod);
		this.execute();
	}); 
}

function require(name) {
	var self = require.importer;
	var want = name.substring(name.lastIndexOf('/')+1);
	if (self.table[want])
		return self.table[want];
	else
		throw new Error("No entry for " + name + " as " + want + " in " + Object.keys(self.table));
}
