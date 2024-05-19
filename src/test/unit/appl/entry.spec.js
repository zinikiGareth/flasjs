import { FLContext } from '../../../main/javascript/runtime/flcxt.js';
import { expect } from 'chai';
import { RoutingEntry } from '../../../main/javascript/runtime/appl/routingentry.js';
import { SampleApp, downagainMap, paramsMap } from './sample.js';

describe('Creating Routing Entry objects', () => {
	it('params is not secure', () => {
        var top = new RoutingEntry(paramsMap());
        expect(top.secure).to.be.false;
	});

	it('downAgain has a route <home>', () => {
        var top = new RoutingEntry(downagainMap());
        var home = top.route("home");
        expect(home).to.be.instanceOf(RoutingEntry);
	});

	it('downAgain.home has a route <settings>', () => {
        var top = new RoutingEntry(downagainMap());
        var home = top.route("home");
        var settings = home.route("settings");
        expect(settings).to.be.instanceOf(RoutingEntry);
	});

	it('downAgain itself does not have a route <settings>', () => {
        var top = new RoutingEntry(downagainMap());
        var missing = top.route("settings");
        expect(missing).to.be.null;
	});

	it('params can find a route give an arbitrary param', () => {
        var top = new RoutingEntry(paramsMap());
        var withParam = top.route("hello");
        expect(withParam).to.be.instanceOf(RoutingEntry);
	});

	it('params will give settings if it is asked for that', () => {
        var top = new RoutingEntry(paramsMap());
        var settings = top.route("settings");
        expect(settings).to.be.instanceOf(RoutingEntry);
        expect(settings.path).to.equal("settings");
	});
});
