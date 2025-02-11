import { WSBridge } from "../forjava/wsbridge.js";

function exposeTests(into) {
	into.bridge = new WSBridge("localhost", 14040); // TODO: might want to generalise this
	into.runner = into.bridge.runner;

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
		into.testing.methods = figureMethods(into.testing.test);
	}

	into.runto = function(tostep) {
		if (into.testing.amAt >= into.testing.methods.length) {
			console.log("test complete; restart to rerun");
			return;
		}
		var untilStep = figureStep(into.testing.methods, tostep);
		if (untilStep == null) {
			return;
		}
		if (!into.testing.amAt) {
			into.testing.amAt = 0
		}
		if (into.testing.amAt > untilStep) {
			console.log("cannot go back in time; restart test to do that; already at", into.testing.methods[into.testing.amAt]);
			return;
		}
		/*
		while (into.testing.amAt <= untilStep) {
			var test = into.testing.test;
			var methName = into.testing.methods[into.testing.amAt];
			console.log("need to run step", methName);
			var meth = test[methName];
			var cxt = into.runner.newContext();
			meth.call(test, cxt);
			into.testing.amAt++;
		}
		*/
		var steps = [];
		while (into.testing.amAt <= untilStep) {
			steps.push(into.testing.methods[into.testing.amAt++]);
		}
		into.bridge.send({action:"steps", steps: steps});
	}
}

function figureMethods(inTest) {
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

function figureStep(steps, nickname) {
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