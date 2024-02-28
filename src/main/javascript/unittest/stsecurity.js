function STSecurityModule() {
	this.currentUser = null;
}

STSecurityModule.prototype.requireLogin = function() {
	return this.currentUser != null;
}

STSecurityModule.prototype.userLoggedIn = function(_cxt, app, user) {
	this.currentUser = user;
	app.nowLoggedIn(_cxt);
}

export { STSecurityModule }