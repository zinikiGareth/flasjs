

// so a RouteEvent is responsible for keeping track of a route through multiple states
// well, actually the state is responsible for that, and we have one event for each time we want to give the system time to settle down

var RouteTraversalState = function(appl) {
    this.appl = appl;
}

var RouteEvent = function(route, stateOrAppl, lastAct) {
    this.route = route;
    this.action = nextAction(lastAct);
    if (stateOrAppl instanceof RouteTraversalState)
        this.state = stateOrAppl;
    else
        this.state = new RouteTraversalState(stateOrAppl);
}

RouteEvent.prototype.dispatch = function(cxt) {
    console.log("route =", this.route, "action =", this.action);
    var nev = new RouteEvent(this.route, this.state, this.action);
    if (nev.action) {
        cxt.env.queueMessages(cxt, nev);
    }
}

// may need to think about this more carefully ...
function nextAction(curr) {
    switch (curr) {
    case null:
    case undefined:
        return "create";
    case "create":
        return "enter";
    case "enter":
        return "at";
    case "at":
        return null;
    }
}
export { RouteEvent };