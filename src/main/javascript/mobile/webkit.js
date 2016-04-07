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

FlasckWK.newElement = function(obj) {
	"use strict";
	console.log("newElement called with " + obj.tag + " " + obj.id + " inside " + obj.inside);
	var elt = document.createElement(obj.tag);
	if (obj.id) {
		elt.setAttribute("id", "flasck" + obj.id);
		FlasckWK.areas[obj.id] = elt;
	}
	var inside = FlasckWK.areas[obj.inside];
	if (!inside) {
		for (var x in FlasckWK.areas)
			console.log("Have area " + x);
	}
	if (obj.after) {
		// not yet supported
		console.log("after not yet supported");
	} else {
	 	inside.appendChild(elt);
	}
}

FlasckWK.setCSS = function(obj) {
	"use strict";
	console.log("want to set css for " + obj.id + " to " + obj.css); 
	var elt = FlasckWK.areas[obj.id];
	elt.className = obj.css;
}

FlasckWK.setText = function(obj) {
	"use strict";
	var text = FlasckWK.areas[obj.id];
	text.innerHTML = '';
	text.appendChild(document.createTextNode(obj.text));
}
