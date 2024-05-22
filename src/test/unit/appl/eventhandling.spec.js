import { FLContext } from '../../../main/javascript/runtime/flcxt.js';
import { CommonEnv } from '../../../main/javascript/runtime/env.js';

import sinon from 'sinon';
import { expect } from 'chai';
// import waitForExpect from 'wait-for-expect';
import { RoutingEntry } from '../../../main/javascript/runtime/appl/routingentry.js';
import { Route } from '../../../main/javascript/runtime/appl/route.js';
import { SampleApp, downagainMap, paramsMap } from './sample.js';
import { RouteEvent } from '../../../main/javascript/runtime/appl/routeevent.js';

describe('Firing events', () => {
    var bridge = console;
    var broker = {};
    var env = new CommonEnv(bridge, broker);
    var cxt = env.newContext();
    var appl = {
        createCard: function() {},
        readyCard: function() {}
    };
    var ma = sinon.mock(appl);
    var table = new RoutingEntry(paramsMap());

	it('an initial route will call the constructors for the main card', () => {
        var goto = Route.parse('', table, new URL("https://hello.world/"));
        var ev = new RouteEvent(goto.movingFrom(null), appl);
        ma.expects("createCard").returns(null);
        ma.expects("readyCard", "main");
        cxt.env.queueMessages(cxt, ev);
        return waitForExpect(() => expect(cxt.env.quiescent()).to.be.true).then(() => ma.verify());
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
  
  
