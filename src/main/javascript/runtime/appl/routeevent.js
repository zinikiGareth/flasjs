

// so a RouteEvent is responsible for keeping track of a route through multiple states
// well, actually the state is responsible for that, and we have one event for each time we want to give the system time to settle down

var RouteTraversalState = function(appl) {
    this.appl = appl;
    this.newcards = [];
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
    if (this.route.length() == 0) {
        return; // we have nothing to do
    }
    if (this.route.head().action == "push") {
        if (this.processDownAction(cxt) == "break")
            return;
    } else
        this.processUpAction(cxt);
    this.queueNextAction(cxt);
}

RouteEvent.prototype.processDownAction = function(cxt) {
    switch (this.action) {
    case "title": {
        if (this.route.head().entry.title) {
            this.state.appl.setTitle(this.route.head().entry.title);
        }
        break;
    }
    case "secure": {
        var e = this.route.head();
        if (this.route.head().entry.secure) {
            // We pass the next event to handleSecurity and don't queue it
            var nev = new RouteEvent(this.route, this.state, this.action);
            this.state.appl.handleSecurity(cxt, nev);
            return "break";
        }
        break;
    }
    case "create": {
        for (var ci of this.route.head().entry.cards) {
            this.state.appl.createCard(ci);
            this.state.newcards.unshift(ci.name);
        }
        break;
    }
    case "enter": {
        for (var act of this.route.head().entry.enter) {
            var arg;
            if (act.contract == "Lifecycle" && act.action == "query") {
                arg = this.route.getQueryParam(act.args[0].str);
            }
            this.state.appl.oneAction(act, arg);
        }
        break;
    }
    case "at": {
        for (var act of this.route.head().entry.at)
            this.state.appl.oneAction(act);
        break;
    }
    case "exit": {
        // does not apply downwards
        break;
    }
   default: {
        throw new Error("cannot handle action " + this.action);
    }
    }
}

RouteEvent.prototype.processUpAction = function(cxt) {
    switch (this.action) {
    case "title":
    case "create":
    case "enter":
    case "secure":
    case "at": {
        // do not apply upwards
        break;
    }
    case "exit": {
        for (var act of this.route.head().entry.exit) {
            var arg;
            this.state.appl.oneAction(act, arg);
        }
        break;
    }
    default: {
        throw new Error("cannot handle action " + this.action);
    }
    }
}

RouteEvent.prototype.queueNextAction = function(cxt) {
    // in the fullness of time, this should add the event to the "only fire when quiescent" list of messages
    var nev = new RouteEvent(this.route, this.state, this.action);
    if (nev.action) {
        cxt.env.queueMessages(cxt, nev);
    } else {
        this.route.advance();
        if (this.route.length() > 0) {
            nev = new RouteEvent(this.route, this.state, null);
            cxt.env.queueMessages(cxt, nev);
        } else {
            this.alldone(cxt);
        }
    }
}

// make ready, set title & record history (see movedown - not sure why it is not in moveup)
RouteEvent.prototype.alldone = function(cxt) {
    for (var c of this.state.newcards) {
        this.state.appl.readyCard(c);
    }
    this.state.appl.setTitle
}

// may need to think about this more carefully ...
function nextAction(curr) {
    switch (curr) {
    case null:
    case undefined:
        return "secure";
    case "secure":
        return "title";
    case "title":
        return "create";
    case "create":
        return "enter";
    case "enter":
        return "exit";
    case "exit":
        return "at";
    case "at":
        return null;
    }
}
export { RouteEvent };