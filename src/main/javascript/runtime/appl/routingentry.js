// The routing table is generated as JSON, but we want to deal with objects, so create objects from the JSON tree

function RoutingEntry(entry) {
    this.secure = entry.secure;
    this.title = entry.title;
    this.namedPaths = {};
    this.paramRoute = null;
    this.path = entry.path;
    this.param = entry.param;
    this.cards = entry.cards;
    this.enter = entry.enter;
    this.at = entry.at;
    this.exit = entry.exit;
    for (var sub of entry.routes) {
        if (sub.path) {
            this.namedPaths[sub.path] = new RoutingEntry(sub);
        } else if (sub.param) {
            this.paramRoute = new RoutingEntry(sub);
        }
    }
}

RoutingEntry.prototype.route = function(path) {
    if (this.namedPaths[path]) {
        return this.namedPaths[path];
    } else if (this.paramRoute) {
        return this.paramRoute;
    } else
        return null;
}

export { RoutingEntry };