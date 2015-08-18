"use strict";

var atmosphere = requireModule('atmosphere');
window.Zinc = {}

var connpool = {};

Zinc.Config = {
  hbTimeout: 90000,
  reconnInterval: 2500
};

function ZincError(message) {
  this.name = "ZincError";
  this.message = message;
  this.stack = (new Error()).stack;
}
ZincError.prototype = new Error();

/* A Connection represents a single, multiplexed, physical channel between here and a server at a URI.
 * Once created, it is the job of the connection to keep everything connected as much as possible and to use the Requestors to reconnect.
 */
function Connection(uri) {
  var self = this;
  this.isBroken = false;
  this.sentEstablish = false;
  this.requestors = [];
  // ----
  var atmoreq = new atmosphere.AtmosphereRequest({
    url: uri
  });
  atmoreq.url = uri;
  atmoreq.transport = 'websocket';
  atmoreq.fallbackTransport = 'long-polling';
  atmoreq.onOpen = function() {
    self.connect();
  };
  atmoreq.onMessage = function(msg) {
//  	console.log("onMessage " + msg.status + ": " + msg.responseBody);
    if (!msg || !msg.status || msg.status != 200 || !msg.responseBody)
      console.log("invalid message received", msg);
    self.processIncoming(msg.responseBody);
  };
  // ---
  atmoreq.onError = function(e) {
    console.log("saw error " + new Date());
    self.isBroken = true;
    self.sentEstablish = false;
    self.onresponse = {}; // throw away all existing "waiting for response" handlers
    self.reconnecting = setTimeout(function() {
      if (self.isBroken) {
        console.log("attempting to restore connection");
        self.atmo = atmosphere.subscribe(atmoreq);
        self.connect();
        self.isBroken = false;
      }
    }, 2500);
  };
  atmoreq.logLevel = 'debug';
  this.atmo = atmosphere.subscribe(atmoreq);
  this.nextId = 0;
  this.onresponse = {};
  this.dispatch = {};
  this.heartbeatInterval = setInterval(function() {
    if (self.sentEstablish) {
      console.log("sending heartbeat");
      self.atmo.push(JSON.stringify({"request":{"method":"heartbeat"}}));
    } else
      console.log("timer fired with nothing to do");
  }, Zinc.Config.hbTimeout);
}

Connection.prototype.connect = function() {
  var self = this;
  console.log("sending establish");
  var msg = {"request":{"method":"establish"}};
  self.atmo.push(JSON.stringify(msg));
  self.sentEstablish = true;
  this.requestors.forEach(function(reqr) {
  	reqr.connected();
  });
}

Connection.prototype.disconnect = function() {
  clearInterval(this.heartbeatInterval);
  atmosphere.unsubscribe();
}

Connection.prototype.nextHandler = function(handler) {
  var ret = ++this.nextId;
  this.dispatch[ret] = handler;
  return ret;
}

Connection.prototype.processIncoming = function(json) {
  var msg = JSON.parse(json);
  if (msg.requestid) {
    if (this.onresponse[msg.requestid]) {
      this.onresponse[msg.requestid](msg);
      delete this.onresponse[msg.requestid];
    }
  } else if (msg.subscription) {
    if (this.onresponse[msg.subscription]) {
      this.onresponse[msg.subscription](msg);
      delete this.onresponse[msg.subscription];
    }
    // Handle ongoing data input
    if (!this.dispatch[msg.subscription]) {
      console.log("received message for closed handle " + msg.subscription);
      return;
    }
    this.dispatch[msg.subscription](msg);
  }
}

/* A Requestor represents a logical connection to a remote endpoint.  Multiple Requestors can be multiplexed across a single physical Connection */
function Requestor(uri) {
  this.uri = uri;
  this.connect = [];
  this.subscriptions = [];
  this.pending = [];
  // this.retryable = []; // this would be for things that need to retry until acknowledged after break
  
  if (connpool[uri]) {
    this.conn = connpool[uri];
    this.conn.requestors.push(this);
  } else {
    this.conn = new Connection(uri);
    connpool[uri] = this.conn;
    this.conn.requestors.push(this);
  }
}

Requestor.prototype.connected = function() {
  var self = this;
  var conn = this.conn;
  this.fullyConnected = false;
  this.delayCount = 0;
  this.connect.forEach(function(r) {
    if (r.wait)
      self.delayCount++;
    var req = r.req;
    if (req instanceof Function)
      req = req(self);
    else
      conn.atmo.push(JSON.stringify(req.msg));
  });
  if (this.delayCount === 0)
    this.resubscribe();
}

Requestor.prototype.delayConnectivity = function() {
  this.delayCount++;
}

Requestor.prototype.advanceConnectivity = function() {
  this.delayCount--;
  if (this.delayCount === 0)
    this.resubscribe();
}

Requestor.prototype.resubscribe = function() {
  var conn = this.conn;
  this.subscriptions.forEach(function(s) {
    conn.atmo.push(JSON.stringify(s.msg));
  });
  this.pending.forEach(function(p) {
    conn.atmo.push(JSON.stringify(p.msg));
  });
  if (this.conn.sentEstablish)
    this.fullyConnected = true;
}

Requestor.prototype.subscribe = function(resource, handler) {
  if (!handler)
    throw "subscribe requires a handler";
  var req = new MakeRequest(this, "subscribe", handler);
  req.req.resource = resource;
  return req;
}

Requestor.prototype.create = function(resource, handler) {
  var req = new MakeRequest(this, "create", handler);
  req.req.resource = resource;
  return req;
}

Requestor.prototype.invoke = function(resource, handler) {
  var req = new MakeRequest(this, "invoke", handler);
  req.req.resource = resource;
  return req;
}

Requestor.prototype.cancelAnySubscriptionTo = function(resource) {
  this.cancelMatchingSubscriptions(function(request) {
    return request.req.resource === resource;
  });
}

Requestor.prototype.cancelAllSubscriptions = function() {
  this.cancelMatchingSubscriptions(function(request) {
    return true;
  });
}

Requestor.prototype.cancelMatchingSubscriptions = function(predicate) {
  var requestsToCancel = [];
  for (var id in this.conn.openSubscriptions)
    if (this.conn.openSubscriptions.hasOwnProperty(id))
    {
      var request = this.conn.openSubscriptions[id];
      if (predicate(request))
        requestsToCancel.push(request);
    }
  for (var request of requestsToCancel)
    request.unsubscribe();
}

Requestor.prototype.sendJson = function(request, id, json) {
  if (this.conn.sentEstablish)
    this.conn.atmo.push(JSON.stringify(json));
  else
    this.pending.push(JSON.stringify(json));
}

// TODO: for the general case, we want to consider that "request" can also be a function.
// In this case, we process request and hold off on doing ANYTHING else until request is completed without any descendants.
// It's not clear what is meant by descendant here.
Requestor.prototype.onConnect = function(request, waitForCompletion) {
  this.connect.push({req: request, wait: waitForCompletion});
  if (this.conn.sentEstablish) {
    if (request instanceof Function)
      request = request(this);
    this.conn.atmo.push(JSON.stringify(request.msg));
  }
}

Requestor.prototype.beginSubscribing = function(request) {
  this.subscriptions.push(request);
  if (this.fullyConnected)
    this.conn.atmo.push(JSON.stringify(request.msg));
}

Requestor.prototype.disconnect = function() {
  this.conn.disconnect();
}

Requestor.prototype.toString = function() {
  return "Requestor[" + this.conn.req.url + "]";
}

function MakeRequest(requestor, method, handler) {
  this.requestor = requestor;
  this.handler = handler;
  this.req = {"method": method};
  this.msg = {"request": this.req};
  if (method === 'subscribe')
    this.msg.subscription = this.requestor.conn.nextHandler(handler);
  this.method = method;
}

MakeRequest.prototype.getHandler = function () {
  return this.handler;
}

MakeRequest.prototype.setOption = function(opt, val) {
  if (!this.req.options)
    this.req.options = {};
  if (this.req.options[opt])
    throw "Option " + opt + " is already set";
  this.req.options[opt] = val;
  return this;
}

MakeRequest.prototype.setPayload = function(json) {
  if (this.msg.payload)
    throw "Cannot set the payload more than once";
  this.msg.payload = json;
  return this;
}

MakeRequest.prototype.send = function() {
  if (this.msg.subscription) {
    this.requestor.beginSubscribing(this);
  } else {
    this.msg.requestid = ++this.requestor.conn.nextId;
    if (this.handler)
      this.requestor.conn.onresponse[this.msg.requestid] = this.handler;
    this.requestor.sendJson(this, this.msg.requestid, this.msg);
  }
}

MakeRequest.prototype.onConnect = function() {
  if (this.msg.subscription)
    throw new Error("Subscriptions are automatically reconnected");
  this.msg.requestid = ++this.requestor.conn.nextId;
    if (this.handler)
      this.requestor.conn.onresponse[this.msg.requestid] = this.handler;
  this.requestor.onConnect(this);
}

MakeRequest.prototype.unsubscribe = function() {
  if (!this.msg.subscription)
    throw "There is no subscription to unsubscribe"
  this.conn.sendJson({subscription: this.msg.subscription, request: {method: "unsubscribe"}});
  delete this.conn.openSubscriptions[this.msg.subscription];
}

Zinc.newRequestor = function(uri) {
  return new Requestor(uri);
}
