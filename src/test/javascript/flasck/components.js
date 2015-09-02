var login_html =
"<form id='loginForm' class='form-horizontal full-page-form'>\n" +
"	<fieldset id='loginFields'>\n" +
"		<legend>Ziniki</legend>\n" +
"		<!--\n" +
"		{{#if guardOnDuty}}\n" +
"		<div class='alert alert-info'>{{guardOnDuty.label}}</div>\n" +
"		{{/if}}\n" +
"		-->\n" +
"		<div class='form-group'>\n" +
"			<label class='ziniki-control-label'>Username</label>\n" +
"			<div class='ziniki-controls'><input type='text' id='username' focused=true></div>\n" +
"		</div>\n" +
"		<div class='form-group'>\n" +
"			<label class='ziniki-control-label'>Password</label>\n" +
"			<div class='ziniki-controls'><input type='password' id='password'></div>\n" +
"		</div>\n" +
"		<div>\n" +
"			<div class='ziniki-unlabeled-controls'><button id='logInButton' type='button' class='btn btn-default' onclick='zinikiLogin()'>Log in</button></div>\n" +
"		</div>\n" +
"		<div class='form-group'>\n" +
"			<div id='loginError' class='ziniki-unlabeled-controls has-error' style='display: none'><span class='help-block'>Login failed</span></div>\n" +
"		</div>\n" +
"		<div class='form-group-spacer-medium'>\n" +
"		</div>\n" +
"		<!--\n" +
"		<div class='form-group'>\n" +
"			{{view 'identityProviders' label='Or sign in with' actionVerb='Log in' activityName='login'}}\n" +
"		</div>\n" +
"		-->\n" +
"		<!--\n" +
"		{{#if userApprovalOfRegistration}}\n" +
"		<div class='form-group'>\n" +
"			<div class='ziniki-unlabeled-controls-wide'>\n" +
"				<div class='alert alert-warning'>\n" +
"					{{userApprovalOfRegistration.credentialName}} hasn't yet been registered with Ziniki.\n" +
"					{{#if registrationPromptsAreAllowed}}\n" +
"					Would you like to register it now?\n" +
"					<button id='userApprovalOfRegistrationYes' class='btn btn-warning' type='button' {{action 'acceptApprovalOfRegistration'}}>Yes</button>\n" +
"					{{/if}}\n" +
"				</div>\n" +
"			</div>\n" +
"		</div>\n" +
"		{{/if}}\n" +
"		-->\n" +
"		<!--\n" +
"		{{#if registrationPromptsAreAllowed}}\n" +
"		<div class='form-group-spacer-small'>\n" +
"		</div>\n" +
"		<div class='form-group'>\n" +
"			<div class='ziniki-unlabeled-controls'>\n" +
"				{{#if userApprovalOfRegistration}}\n" +
"				You can also {{#link-to 'register' id='register'}}register{{/link-to}} a different account, or a new username.\n" +
"				{{else}}\n" +
"				Or you can {{#link-to 'register' id='register'}}register{{/link-to}} a new account.\n" +
"				{{/if}}\n" +
"			</div>\n" +
"		</div>\n" +
"		{{/if}}\n" +
"		-->\n" +
"	</fieldset>\n" +
"</form>\n" +
"";

var popover_html =
"	<div id='flasck_popover_chrome'>\n" +
"		<a style='text-decoration: none;' onclick='FlasckComponents.closePopover()'>X</a>\n" +
"	</div>\n" +
"	<div id='flasck_popover_div'>\n" +
"	</div>\n" +
"";

var toolbar_html =
"  	<div class='toolbar'>\n" +
"  		<span id='currentUser' class='logged-in-user'></span>\n" +
"  		<button class='toolbar-button' onclick='FlasckComponents.logout()'>log out</button>\n" +
"  	</div>\n" +
"";

FlasckComponents = {};

FlasckComponents.provideLogin = function(div) {
	var dialog = div.ownerDocument.createElement("dialog");
	dialog.id = 'flasck_login';
	dialog.innerHTML = login_html;
	div.appendChild(dialog);
}

FlasckComponents.providePopover = function(div) {
	var dialog = div.ownerDocument.createElement("dialog");
	dialog.id = 'flasck_popover';
	dialog.innerHTML = popover_html;
	div.appendChild(dialog);
}

FlasckComponents.currentCard = null;

FlasckComponents.popoverCard = function(postbox, services, card) {
	var popover = doc.getElementById('flasck_popover_div');
	popover.innerHTML = '';
	var card = Flasck.createCard(postbox, popover, { mode: 'overlay', explicit: card }, services);
	FlasckComponents.currentCard = card
	doc.getElementById('flasck_popover').showModal();
	return card;
}

FlasckComponents.closePopover = function() {
	document.getElementById("flasck_popover").close();
	FlasckComponents.currentCard.dispose();
}

FlasckComponents.provideToolbar = function(div) {
	var bar = div.ownerDocument.createElement("div");
	bar.innerHTML = toolbar_html;
	div.appendChild(bar);
}

FlasckComponents.logout = function() {
	console.log("logging out ...");
	var user = doc.getElementById('username');
	var pwd = doc.getElementById('password');
	user.value = '';
	pwd.value = '';
	var single = doc.getElementById('single');
	single.innerHTML = '';
	new FlasckServices.CredentialsService(doc, postbox).logout();
}
		
