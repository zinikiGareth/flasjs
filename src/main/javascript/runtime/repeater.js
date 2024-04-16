import { Debug, Send, Assign, ResponseWithMessages, UpdateDisplay } from './messages.js';

const ContainerRepeater = function() {
}

ContainerRepeater.prototype.callMe = function(cx, callback) {
    return Send.eval(cx, callback, "call", []);
}

export { ContainerRepeater };