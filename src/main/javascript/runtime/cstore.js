import { NamedIdempotentHandler } from '../../resources/ziwsh';

const ContractStore = function(_cxt) {
    this.env = _cxt.env;
    this.recorded = {};
    this.toRequire = {};
}

ContractStore.prototype.record = function(_cxt, name, impl) {
    this.recorded[name] = impl;
}

ContractStore.prototype.contractFor = function(_cxt, name) {
    const ret = this.recorded[name];
    if (!ret)
        throw new Error("There is no contract for " + name);
    return ret;
}

ContractStore.prototype.require = function(_cxt, name, clz) {
    const ctr = _cxt.broker.contracts[clz];
    const di = new DispatcherInvoker(this.env, _cxt.broker.require(clz));
    const px = proxy(_cxt, ctr, di);
    px._areYouA = function(cx, ty) { return ty === clz; }
    this.toRequire[name] = px;
}

ContractStore.prototype.required = function(_cxt, name) {
    const ret = this.toRequire[name];
    if (!ret)
        throw new Error("There is no provided contract for var " + name);
    return ret;
}

const DispatcherInvoker = function(env, call) {
    this.env = env;
    this.call = call;
}

DispatcherInvoker.prototype.invoke = function(meth, args) {
    // The context has been put as args 0; use it but pull it out
    // The handler will already have been patched in here, so pull it back out
    var pass = args.slice(1, args.length-1);
    var hdlr = args[args.length-1];
    var hdlrName = null;
    if (hdlr instanceof NamedIdempotentHandler) {
        hdlrName = hdlr._name;
        hdlr = hdlr._handler;
    }
    var cx = args[0];
    if (!cx.subcontext) {
        cx = cx.bindTo(hdlr);
    }
    this.env.queueMessages(cx, Send.eval(cx, this.call, meth, pass, hdlr, hdlrName));
}

export { ContractStore };