import { FLContext } from '../../../main/javascript/runtime/flcxt.js';
import { expect } from 'chai';
import { RoutingEntry } from '../../../main/javascript/runtime/appl/routingentry.js';
import { Route } from '../../../main/javascript/runtime/appl/route.js';
import { SampleApp, downagainMap, paramsMap } from './sample.js';

describe('Parsing URL paths', () => {
    var table = new RoutingEntry(paramsMap());

	it('we can parse a simple URI with no base URI', () => {
        var path = Route.parse('', table, new URL("https://hello.world/"));
        expect(path.length()).to.equal(1);
	});

	it('we can parse a simple fragment with no base URI', () => {
        var path = Route.parse('', table, new URL("https://hello.world/#settings"));
        expect(path.length()).to.equal(2);
        expect(path.head().entry).to.equal(table);
        path.advance();
        expect(path.length()).to.equal(1);
        expect(path.head().entry).to.equal(table.route("settings"));
        path.advance();
        expect(path.length()).to.equal(0);
	});

	it('parse can promote a string to a URL', () => {
        var path = Route.parse('', table, "https://hello.world/#settings");
        expect(path.length()).to.equal(2);
	});

	it('it can handle a simple path with baseuri set to a full URL with a slash', () => {
        var path = Route.parse("https://hello.world/", table, "https://hello.world/settings");
        expect(path.length()).to.equal(2);
	});

	it('it can handle a simple path with baseuri set to a URL containing a full URL with a slash', () => {
        var path = Route.parse(new URL("https://hello.world/"), table, "https://hello.world/settings");
        expect(path.length()).to.equal(2);
	});

	it('it can handle a simple path with baseuri set to a full URL without a slash', () => {
        var path = Route.parse("https://hello.world", table, "https://hello.world/settings");
        expect(path.length()).to.equal(2);
	});

	it('it can handle a simple path with baseuri set to just a path', () => {
        var path = Route.parse("/servlet", table, "https://hello.world/servlet/settings");
        expect(path.length()).to.equal(2);
	});
});
