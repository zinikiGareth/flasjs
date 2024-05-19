import { Application } from "../../../main/javascript/runtime/appl/appl.js";

var sample = function(_cxt, div, baseuri) {
    Application.call(this, _cxt, div, baseuri);
    this.title = 'Sample';
    return ;
}

sample.prototype = new Application();
sample.prototype.constructor = sample;

export { sample as Sample };