import { FLContext } from '../../../main/javascript/runtime/flcxt.js';
import { CommonEnv } from '../../../main/javascript/runtime/env.js';

import sinon from 'sinon';
import { expect } from 'chai';
// import waitForExpect from 'wait-for-expect';
import { RoutingEntry } from '../../../main/javascript/runtime/appl/routingentry.js';
import { Route } from '../../../main/javascript/runtime/appl/route.js';
import { SampleApp, downagainMap, paramsMap, queryMap } from './sample.js';
import { RouteEvent } from '../../../main/javascript/runtime/appl/routeevent.js';

describe('Firing events', () => {
    var bridge = console;
    var broker = {};
    var env = new CommonEnv(bridge, broker);
    var cxt = env.newContext();
    var appl = {
        handleSecurity: function() {},
        createCard: function() {},
        oneAction: function() {},
        readyCard: function() {}
    };

	it('an initial route will call the constructors for the main card', () => {
        var table = new RoutingEntry(paramsMap());
        var goto = Route.parse('', table, new URL("https://hello.world/"));
        var cr = sinon.spy(appl, "createCard");
        var rc = sinon.spy(appl, "readyCard");
        var ev = new RouteEvent(goto.movingFrom(null), appl);
        // ma.expects("createCard").returns(null);
        // ma.expects("readyCard", "main");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(cr.calledBefore(rc)).to.be.true;
        }).finally(() => { cr.restore(); rc.restore(); });
	});

    it('enter is called for an initial route', () => {
        var table = new RoutingEntry(downagainMap());
        var goto = Route.parse('', table, new URL("https://hello.world/"));
        var ev = new RouteEvent(goto.movingFrom(null), appl);
        var cr = sinon.spy(appl, "createCard");
        var act = sinon.spy(appl, "oneAction");
        var rc = sinon.spy(appl, "readyCard");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(cr.getCall(0).calledBefore(act.getCall(0))).to.be.true;
            expect(act.getCall(0).calledBefore(rc.getCall(0))).to.be.true;
        }).finally(() => {
            cr.restore(); act.restore(); rc.restore();
        });
	});

    it('at is called for an initial route', () => {
        var map = downagainMap();
        map.at.push(map.enter.shift()); // move enter entry to at
        var table = new RoutingEntry(map);
        var goto = Route.parse('', table, new URL("https://hello.world/"));
        var ev = new RouteEvent(goto.movingFrom(null), appl);
        var cr = sinon.spy(appl, "createCard");
        var act = sinon.spy(appl, "oneAction");
        var rc = sinon.spy(appl, "readyCard");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(cr.getCall(0).calledBefore(act.getCall(0))).to.be.true;
            expect(act.getCall(0).calledBefore(rc.getCall(0))).to.be.true;
        }).finally(() => {
            cr.restore(); act.restore(); rc.restore();
        });
	});

    // If a route does not exist, we abandon it at the last meaningful location, in this case the root
    // TODO: Do we/can we rewrite the current URL?
    it('some routes do not exist', () => {
        var table = new RoutingEntry(downagainMap());
        var goto = Route.parse('', table, new URL("https://hello.world/#sort-of-404"));
        var ev = new RouteEvent(goto.movingFrom(null), appl);
        var cr = sinon.spy(appl, "createCard");
        var act = sinon.spy(appl, "oneAction");
        var rc = sinon.spy(appl, "readyCard");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(cr.getCalls().length).to.equal(1);
            expect(act.getCalls().length).to.equal(1);
            expect(rc.getCalls().length).to.equal(1);

            expect(cr.getCall(0).args[1].name).to.equal("main");
            
            expect(act.getCall(0).args[1].card).to.equal("main");
            expect(act.getCall(0).args[1].action).to.equal("load");

            expect(rc.getCall(0).args[1]).to.equal("main");

        }).finally(() => {
            cr.restore(); act.restore(); rc.restore();
        });
	});

    it('three tiers happen getting to history/4200', () => {
        var table = new RoutingEntry(paramsMap());
        var goto = Route.parse('', table, new URL("https://hello.world/#history/4200"));
        var ev = new RouteEvent(goto.movingFrom(null), appl);
        var cr = sinon.spy(appl, "createCard");
        var act = sinon.spy(appl, "oneAction");
        var rc = sinon.spy(appl, "readyCard");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(cr.getCalls().length).to.equal(2);
            expect(act.getCalls().length).to.equal(3);
            expect(rc.getCalls().length).to.equal(2);

            expect(cr.getCall(0).args[1].name).to.equal("main");
            expect(cr.getCall(1).args[1].name).to.equal("history");
            expect(cr.getCall(1).calledBefore(act.getCall(0))).to.be.true;
            
            expect(act.getCall(0).args[1].card).to.equal("history");
            expect(act.getCall(0).args[1].action).to.equal("load");
            expect(act.getCall(1).args[1].card).to.equal("main");
            expect(act.getCall(1).args[1].action).to.equal("nest");
            expect(act.getCall(2).args[1].card).to.equal("history");
            expect(act.getCall(2).args[1].action).to.equal("load");
            expect(act.getCall(2).calledBefore(rc.getCall(0))).to.be.true;

            expect(rc.getCall(0).args[1]).to.equal("history");
            expect(rc.getCall(1).args[1]).to.equal("main");

        }).finally(() => {
            cr.restore(); act.restore(); rc.restore();
        });
	});

    it('a subroute does not call ready on the main card again', () => {
        var table = new RoutingEntry(downagainMap());
        var from = Route.parse('', table, new URL("https://hello.world/"));
        var goto = Route.parse('', table, new URL("https://hello.world/#home"));
        var ev = new RouteEvent(goto.movingFrom(from), appl);
        var cr = sinon.spy(appl, "createCard");
        var act = sinon.spy(appl, "oneAction");
        var rc = sinon.spy(appl, "readyCard");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(cr.getCalls().length).to.equal(1);
            expect(cr.getCall(0).args[1].name).to.equal("home");
            expect(cr.getCall(0).calledBefore(act.getCall(0))).to.be.true;
            expect(act.getCalls().length).to.equal(2);
            expect(act.getCall(0).args[1].card).to.equal("home");
            expect(act.getCall(0).args[1].action).to.equal("load");
            expect(act.getCall(1).args[1].card).to.equal("main");
            expect(act.getCall(1).args[1].action).to.equal("nest");
            expect(act.getCall(1).calledBefore(rc.getCall(0))).to.be.true;
            expect(rc.getCalls().length).to.equal(1);
            expect(rc.getCall(0).args[1]).to.equal("home");
        }).finally(() => {
            cr.restore(); act.restore(); rc.restore();
        });
	});

    it('it is possible to go up and down again', () => {
        var table = new RoutingEntry(paramsMap());
        var from = Route.parse('', table, new URL("https://hello.world/#settings"));
        var goto = Route.parse('', table, new URL("https://hello.world/#history"));
        var ev = new RouteEvent(goto.movingFrom(from), appl);
        var cr = sinon.spy(appl, "createCard");
        var act = sinon.spy(appl, "oneAction");
        var rc = sinon.spy(appl, "readyCard");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(act.getCalls().length).to.equal(3);
            expect(cr.getCalls().length).to.equal(1);
            expect(rc.getCalls().length).to.equal(1);

            expect(act.getCall(0).args[1].card).to.equal("settings");
            expect(act.getCall(0).args[1].action).to.equal("closing");
            expect(act.getCall(0).calledBefore(cr.getCall(0))).to.be.true;
            
            expect(cr.getCall(0).args[1].name).to.equal("history");
            expect(cr.getCall(0).calledBefore(act.getCall(1))).to.be.true;
            
            expect(act.getCall(1).args[1].card).to.equal("history");
            expect(act.getCall(1).args[1].action).to.equal("load");
            expect(act.getCall(2).args[1].card).to.equal("main");
            expect(act.getCall(2).args[1].action).to.equal("nest");
            expect(act.getCall(2).calledBefore(rc.getCall(0))).to.be.true;

            expect(rc.getCall(0).args[1]).to.equal("history");
        }).finally(() => {
            cr.restore(); act.restore(); rc.restore();
        });
	});

    it('query parameters are decoded and passed if requested in the map', () => {
        var table = new RoutingEntry(queryMap());
        var goto = Route.parse('', table, new URL("https://hello.world/?arg=hello"));
        var ev = new RouteEvent(goto.movingFrom(null), appl);
        var cr = sinon.spy(appl, "createCard");
        var act = sinon.spy(appl, "oneAction");
        var rc = sinon.spy(appl, "readyCard");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(cr.calledBefore(act)).to.be.true;
            expect(act.calledBefore(rc)).to.be.true;
            expect(act.getCall(0).args.length).to.equal(3);
            expect(act.getCall(0).args[1].card).to.equal("main");
            expect(act.getCall(0).args[1].action).to.equal("query");
            expect(act.getCall(0).args[1].args[0].str).to.equal("arg");
            expect(act.getCall(0).args[2]).to.equal("hello");
        }).finally(() => {
            cr.restore(); act.restore(); rc.restore();
        });
	});

    it('the top level can be secure', () => {
        var qm = queryMap();
        qm.secure = true;
        var table = new RoutingEntry(qm);
        var goto = Route.parse('', table, new URL("https://hello.world/"));
        var ev = new RouteEvent(goto.movingFrom(null), appl);
        var hs = sinon.spy(appl, "handleSecurity");
        var cr = sinon.spy(appl, "createCard");
        var act = sinon.spy(appl, "oneAction");
        var rc = sinon.spy(appl, "readyCard");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => {
            expect(hs.getCalls().length).to.equal(1);
            expect(cr.getCalls().length).to.equal(0);
        }).finally(() => {
            cr.restore(); act.restore(); rc.restore();
        });
	});
});

// For some reason, "wait-for-expect" takes 5s to load as a module, so I just pulled out the relevant code.
var defaults = {
    timeout: 4500,
    interval: 50
  };
  
var waitForExpect = function waitForExpect(expectation) {
    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaults.timeout;
    var interval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaults.interval;
  
    if (interval < 1) interval = 1;
    var maxTries = Math.ceil(timeout / interval);
    var tries = 0;
    return new Promise(function (resolve, reject) {
      var rejectOrRerun = function rejectOrRerun(error) {
        if (tries > maxTries) {
          reject(error);
          return;
        } // eslint-disable-next-line no-use-before-define
  
  
        setTimeout(runExpectation, interval);
      };
  
      function runExpectation() {
        tries += 1;
  
        try {
          Promise.resolve(expectation()).then(function () {
            return resolve();
          }).catch(rejectOrRerun);
        } catch (error) {
          rejectOrRerun(error);
        }
      }
  
      setTimeout(runExpectation, 0);
    });
  };
  
  
