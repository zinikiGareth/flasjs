import { FLContext } from '../../../main/javascript/runtime/flcxt.js';
import { expect } from 'chai';
import { RoutingEntry } from '../../../main/javascript/runtime/appl/routingentry.js';
import { Route } from '../../../main/javascript/runtime/appl/route.js';
import { SampleApp, downagainMap, paramsMap } from './sample.js';

describe('Finding relative routes', () => {
    var table = new RoutingEntry(paramsMap());

	it('we can initially move home', () => {
        var curr = null;
        var goto = Route.parse('', table, new URL("https://hello.world/"));
        var route = goto.movingFrom(curr);
        expect(route.length()).to.equal(2);
        expect(route.head().action).to.equal("push");
        expect(route.head().segment).to.equal("/");
        expect(route.head().entry).to.equal(table);
        route.advance();
        expect(route.head().action).to.equal("at");
        expect(route.head().segment).to.equal("/");
        expect(route.head().entry).to.equal(table);
	});

	it('a route to home is empty if we start at home', () => {
        var curr = Route.parse('', table, new URL("https://hello.world/"));
        var goto = Route.parse('', table, new URL("https://hello.world/"));
        var route = goto.movingFrom(curr);
        expect(route.length()).to.equal(0);
	});

	it('a route to settings is empty if we start at settings', () => {
        var curr = Route.parse('', table, new URL("https://hello.world/#settings"));
        var goto = Route.parse('', table, new URL("https://hello.world/#settings"));
        var route = goto.movingFrom(curr);
        expect(route.length()).to.equal(0);
	});

	it('a route to settings pushes settings if we start at home', () => {
        var curr = Route.parse('', table, new URL("https://hello.world/"));
        var goto = Route.parse('', table, new URL("https://hello.world/#settings"));
        var route = goto.movingFrom(curr);
        expect(route.length()).to.equal(2);
        expect(route.head().action).to.equal("push");
        expect(route.head().segment).to.equal("settings");
        expect(route.head().entry).to.equal(table.route("settings"));
        route.advance();
        expect(route.head().action).to.equal("at");
        expect(route.head().segment).to.equal("settings");
        expect(route.head().entry).to.equal(table.route("settings"));
	});

	it('a route home pops settings if we started there', () => {
        var curr = Route.parse('', table, new URL("https://hello.world/#settings"));
        var goto = Route.parse('', table, new URL("https://hello.world/"));
        var route = goto.movingFrom(curr);
        expect(route.length()).to.equal(2);
        expect(route.head().action).to.equal("pop");
        expect(route.head().segment).to.equal("settings");
        expect(route.head().entry).to.equal(table.route("settings"));
        route.advance();
        expect(route.head().action).to.equal("at");
        expect(route.head().segment).to.equal("/");
        expect(route.head().entry).to.equal(table);
	});

	it('takes 1 pop and 2 pushes to move from settings to the history of 2020', () => {
        var curr = Route.parse('', table, new URL("https://hello.world/#settings"));
        var goto = Route.parse('', table, new URL("https://hello.world/#history/2020"));
        var route = goto.movingFrom(curr);
        expect(route.length()).to.equal(4);
        expect(route.head().action).to.equal("pop");
        expect(route.head().segment).to.equal("settings");
        expect(route.head().entry).to.equal(table.route("settings"));
        route.advance();
        expect(route.length()).to.equal(3);
        expect(route.head().action).to.equal("push");
        expect(route.head().segment).to.equal("history");
        expect(route.head().entry).to.equal(table.route("history"));
        route.advance();
        expect(route.length()).to.equal(2);
        expect(route.head().action).to.equal("push");
        expect(route.head().segment).to.equal("2020");
        expect(route.head().entry).to.equal(table.route("history").route("2020"));
        route.advance();
        expect(route.length()).to.equal(1);
        expect(route.head().action).to.equal("at");
        expect(route.head().segment).to.equal("2020");
        expect(route.head().entry).to.equal(table.route("history").route("2020"));
        route.advance();
        expect(route.length()).to.equal(0);
	});

	it('takes 2 pops and 1 push to move from the history of 2020 to settings', () => {
        var curr = Route.parse('', table, new URL("https://hello.world/#history/2020"));
        var goto = Route.parse('', table, new URL("https://hello.world/#settings"));
        var route = goto.movingFrom(curr);
        expect(route.length()).to.equal(4);
        expect(route.head().action).to.equal("pop");
        expect(route.head().segment).to.equal("2020");
        expect(route.head().entry).to.equal(table.route("history").route("2020"));
        route.advance();
        expect(route.length()).to.equal(3);
        expect(route.head().action).to.equal("pop");
        expect(route.head().segment).to.equal("history");
        expect(route.head().entry).to.equal(table.route("history"));
        route.advance();
        expect(route.length()).to.equal(2);
        expect(route.head().action).to.equal("push");
        expect(route.head().segment).to.equal("settings");
        expect(route.head().entry).to.equal(table.route("settings"));
        route.advance();
        expect(route.length()).to.equal(1);
        expect(route.head().action).to.equal("at");
        expect(route.head().segment).to.equal("settings");
        expect(route.head().entry).to.equal(table.route("settings"));
        route.advance();
        expect(route.length()).to.equal(0);
	});
});
