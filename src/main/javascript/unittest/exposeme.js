import { WSBridge } from "../forjava/wsbridge.js";

function exposeTests(into) {
	into.bridge = new WSBridge("localhost", 14040); // TODO: might want to generalise this
	into.runner = into.bridge.runner;

	into.unittest = async function(holder, which) {
		into.testing = {};
		var imptest = await import("/js/" + holder + ".js");
		var elt = holder.replaceAll(".", "__");
		var ut = imptest[elt];
		if (typeof(which) === "undefined") {
			for (var t of Object.keys(ut)) {
				if (t.startsWith("_ut")) {
					console.log(" * " + t);
				}
			}
			return;
		}
		if (which.startsWith && which.startsWith("_ut")) {
		} else {
			which = "_ut" + which;
		}
		var utc = ut[which];
		var cxt = into.runner.newContext();
		into.testing.test = new utc(into.runner, cxt);
		into.bridge.currentTest = into.testing.test;
		// for (var m of modules) {
		// 	var impmod = await import("/js/" + m + ".js");
		// 	var installer = impmod.installer;
		// 	installer(into.bridge);
		// }
		into.runner.clear();
		into.testing.steps = into.testing.test.dotest(cxt);
		for (var s of into.testing.steps) {
			console.log(" * " + s);
		}
	}

	into.systest = async function(name, ...modules) {
		into.testing = {};
		var imptest = await import("/js/" + name + ".js");
		var elt = name.replaceAll(".", "__");
		var stc = imptest[elt];
		var cxt = into.runner.newContext();
		into.testing.test = new stc(into.runner, cxt);
		into.bridge.currentTest = into.testing.test;
		for (var m of modules) {
			var impmod = await import("/js/" + m + ".js");
			var installer = impmod.installer;
			installer(into.bridge);
		}
		into.runner.clear();
		into.testing.methods = figureSystemMethods(into.testing.test);
	}

	into.runto = function(tostep) {
		if (into.testing.steps) {
			unitRun(into.bridge, into.testing, tostep);
		} else {
			systemRun(into.bridge, into.testing, tostep);
		}
	}
}

function figureSystemMethods(inTest) {
	var methods = Object.keys(Object.getPrototypeOf(inTest)).sort();
	var ret = [];
	for (var s of methods) {
		if (s.startsWith("configure_step") || s.match("stage[0-9]*_step") || s.startsWith("finally_step")) {
			console.log(" * " + s);
			ret.push(s);
		}
	}
	return ret;
}

function unitRun(bridge, te, tostep) {
	if (te.amAt >= te.steps.length) {
		console.log("test complete; restart to rerun");
		return;
	}
	var untilStep = figureUnitStep(te.steps, tostep);
	if (untilStep == null) {
		return;
	}
	if (!te.amAt) {
		te.amAt = 0
	}
	if (te.amAt > untilStep) {
		console.log("cannot go back in time; restart test to do that; already at", te.steps[te.amAt]);
		return;
	}
	var steps = [];
	while (te.amAt <= untilStep && te.amAt < te.steps.length) {
		steps.push(te.steps[te.amAt++]);
	}
	bridge.send({action:"steps", steps: steps});
}

function systemRun(bridge, te, tostep) {
	if (te.amAt >= te.methods.length) {
		console.log("test complete; restart to rerun");
		return;
	}
	var untilStep = figureSystemStep(te.methods, tostep);
	if (untilStep == null) {
		return;
	}
	if (!te.amAt) {
		te.amAt = 0
	}
	if (te.amAt > untilStep) {
		console.log("cannot go back in time; restart test to do that; already at", te.methods[te.amAt]);
		return;
	}
	var steps = [];
	while (te.amAt <= untilStep) {
		steps.push(te.methods[te.amAt++]);
	}
	bridge.send({action:"steps", steps: steps});
}

function figureUnitStep(steps, step) {
	if (typeof(step) === 'undefined') {
		return steps.length-1;
	}
	return Number(step)-1;
}

function figureSystemStep(steps, nickname) {
	var stepName = null;
	var endOf = null;
	var mg = null;
	if (nickname == "c") {
		endOf = "configure";
	} else if (nickname.match(/^c\.?[0-9]*$/)) {
		stepName = "configure_step_" + nickname.replace("c.", "");
	} else if (nickname.match(/^[0-9]+$/)) {
		endOf = "stage" + nickname;
	} else if ((mg = nickname.match(/^([0-9]+)\.([0-9]+)$/))) {
		stepName = "stage" + mg[1] + "_step_" + mg[2];
	} else if (nickname.match(/^f\.[0-9]+$/)) {
		stepName = "finally_step_" + nickname.replace("f.", "");
	} else if (nickname == "f") {
		return steps.length-1;
	} else {
		stepName = nickname;
	}
	var matchEnd = null;
	for (var i=0;i<steps.length;i++) {
		var s = steps[i];
		if (s == stepName) {
			return i;
		} else if (endOf && s.startsWith(endOf)) {
			matchEnd = i;
		}
	}
	if (matchEnd != null) {
		return matchEnd;
	}
	console.log("no step matched", nickname);
	return null;
}

export { exposeTests };