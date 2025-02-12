// We are passed a Location, URL or String and we need to figure out
// what that means in terms of descent through the routing table.
// This ends up basically just being an array of annotated routing entries

var Segment = function(action, segment, map) {
    this.action = action;
    this.segment = segment;
    this.entry =  map;
}

Segment.prototype.isdir = function() {
    return Object.keys(this.entry.namedPaths).length > 0 || this.entry.paramRoute != null;
}

Segment.prototype.toString = function() {
    return this.action + "->" + this.segment;
}

var Route = function() {
    this.parts = [];
    this.pos = 0;
}

Route.prototype.toString = function() {
    return this.parts.toString();
}

Route.parse = function(baseuri, table, path) {
    if (typeof(path) === 'string') {
        try {
            var p1 = new URL(path);
            path = p1;
        } catch (e) { // handle the case(s) where they just give us a path...
            try {
                var p2 = new URL(baseuri + path);
                path = p2;
            } catch (f) {
                var p3;
                if (path.includes("#"))
                    p3 = new URL("https://base.uri/" + path);
                else if (path.includes("?"))
                    p3 = new URL("https://base.uri/" + path + "#/");
                else
                    p3 = new URL("https://base.uri/#" + path);
                path = p3;
            }
        }
    } else if (path instanceof Location) {
        path = new URL(path.href);
    } else if (!(path instanceof URL)) {
        throw new Error("path is not a url, location or string");
    }
    var claimedRoute = path;
    var query = new URLSearchParams(path.search);
    if (path.hash) {
        path = path.hash.replace(/^#/, "");
    } else if (baseuri) {
        var buu = baseuri;
        if (typeof(buu) == 'string') {
            try {
                buu = new URL(buu);
                buu = buu.path;
            } catch (e) {
                // don't need to do anything - it is just a path
            }
        } else if (buu instanceof URL) {
            buu = buu.path;
        } else {
            throw new Error("baseuri is not a URL or a string");
        }
        if (!buu)
            buu = '';
        if (path && path.pathname)
            path = path.pathname.replace(buu, '');
        else
            path = '';
    } else {
        path = ''; // we can't tell how much of this is for us and how much is the page, so we are stuck
    }
    var route;
    route = path.split("/").filter(i => i);
    var ret = new Route();
    ret.claimedRoute = claimedRoute;
    ret.parts.push(new Segment("push", "/", table));
    var map = table;
    for (var s of route) {
        var next = map.route(s);
        if (!next) {
            // that's an error - the path does not exist, so stop here ...
            console.log("there is no entry in the routing table for", s, "in", next);
            break;
        }
        ret.parts.push(new Segment("push", s, next));
        map = next;
    }
    ret.query = query;
    return ret;
}

Route.prototype.reset = function() {
    this.pos = 0;
}

Route.prototype.length = function() {
    return this.parts.length - this.pos;
}

Route.prototype.head = function() {
    return this.parts[this.pos];
}

Route.prototype.advance = function() {
    this.pos++;
}

Route.prototype.movingFrom = function(from) {
    // routes are both data and cursors, so we reset the "cursor" portion
    this.reset();
    if (from)
        from.reset();
    var ret = new Route();
    ret.claimedRoute = this.claimedRoute;
    ret.query = this.query;
    var popAt = null;
    while (from && this.length() > 0 && from.length() > 0) {
        popAt = from.head();
        if (this.head().segment != from.head().segment)
            break;
        this.advance();
        from.advance();
    }

    // pop off the old things (in reverse order)
    while (from && from.length() > 0) {
        var s = from.head();
        ret.parts.unshift(new Segment("pop", s.segment, s.entry));
        from.advance();
    }

    // now push on the new things
    while (this.length() > 0) {
        popAt = this.head();
        ret.parts.push(this.head());
        this.advance();
    }

    // replicate the last thing on the list as an at operation
    if (popAt != null && ret.parts.length > 0) {
        ret.parts.push(new Segment("at", popAt.segment, popAt.entry));
    }
    return ret;
}

Route.prototype.getQueryParam = function(v) {
    return this.query.get(v);
}

export { Route };