

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
    if (this.route.head().action == "push")
        this.processDownAction(cxt);
    else
        this.processUpAction(cxt);
    this.queueNextAction(cxt);
}

RouteEvent.prototype.processDownAction = function(cxt) {
    switch (this.action) {
    case "title": {
        if (this.route.head().title) {
            this.state.appl.setTitle(this.route.head().title);
        }
        break;
    }
    case "secure": {
        // TBD
        break;
    }
    case "create": {
        for (var ci of this.route.head().entry.cards) {
            this.state.appl.createCard(ci);
            this.state.newcards.push(ci.name);
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
            // add the relevant event back in the "null" state ...
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
        return "title";
    case "title":
        return "secure";
    case "secure":
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