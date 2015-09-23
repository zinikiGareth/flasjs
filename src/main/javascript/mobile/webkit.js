// The big, big, big question is how to send message backwards and forwards about objects & data
// I think we need a big hash map of this & that
// But we need to be able to construct all the complex data structures "on that side" and have them "over here" as well (lists, maps, crosets, etc)
// Or do we ... this side just needs the final residual "what can we display" which should be Elements & simple, visual data items

window.FlasckWK = {};
FlasckWK.areas = {};

FlasckWK.init = function() {
	"use strict";
	FlasckWK.areas["body"] = document.getElementsByTagName("body")[0];
}

FlasckWK.action = function(json) {
	"use strict";
	var obj = JSON.parse(json);
	FlasckWK[obj.action](obj);
}

FlasckWK.newText = function(obj) {
	"use strict";
	var text = document.createTextNode(obj.text);
	var inside = FlasckWK.areas[obj.inside];
	if (obj.after) {
		// not yet supported
	} else {
	 	inside.appendChild(text);
	}
}
