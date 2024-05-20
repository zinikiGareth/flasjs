// We are passed a Location, URL or String and we need to figure out
// what that means in terms of descent through the routing table.
// This ends up basically just being an array of annotated routing entries

var Segment = function(segment, map) {
    this.segment = segment;
    this.entry =  map;
}

var Route = function() {
    this.parts = [];
    this.pos = 0;
}

Route.parse = function(baseuri, table, path) {
    if (typeof(path) === 'string') {
        path = new URL(path);
    } else if (path instanceof Location) {
        path = new URL(path.href);
    } else if (!(path instanceof URL)) {
        throw new Error("path is not a url, location or string");
    }
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
    ret.parts.push(new Segment("/", table));
    var map = table;
    for (var s of route) {
        ret.parts.push(new Segment(s, map.route(s)));
    }
    return ret;
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


export { Route };