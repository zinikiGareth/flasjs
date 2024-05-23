import { FLContext } from '../../../main/javascript/runtime/flcxt.js';
import { CommonEnv } from '../../../main/javascript/runtime/env.js';

import sinon from 'sinon';
import { expect } from 'chai';
// import waitForExpect from 'wait-for-expect';
import { RoutingEntry } from '../../../main/javascript/runtime/appl/routingentry.js';
import { Route } from '../../../main/javascript/runtime/appl/route.js';
import { SampleApp, downagainMap, paramsMap } from './sample.js';
import { RouteEvent } from '../../../main/javascript/runtime/appl/routeevent.js';

describe.only('Firing events', () => {
    var bridge = console;
    var broker = {};
    var env = new CommonEnv(bridge, broker);
    var cxt = env.newContext();
    var appl = {
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
            expect(cr.calledBefore(act)).to.be.true;
            expect(act.calledBefore(rc)).to.be.true;
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
  
  
