import { FLContext } from '../../../main/javascript/runtime/flcxt.js';
import { expect } from 'chai';
import { Route } from '../../../main/javascript/runtime/appl/route.js';
import { SampleApp, downagainMap, paramsMap } from './sample.js';

describe('Parsing URL paths', () => {
	it('we can parse a simple URI with no base URI', () => {
        var path = Route.parse('', paramsMap, new URL("https://hello.world/"));
        expect(path.length()).to.equal(0);
	});

	it('we can parse a simple fragment with no base URI', () => {
        var path = Route.parse('', paramsMap, new URL("https://hello.world/#settings"));
        expect(path.length()).to.equal(1);
	});

	it('parse can promote a string to a URL', () => {
        var path = Route.parse('', paramsMap, "https://hello.world/#settings");
        expect(path.length()).to.equal(1);
	});

	it('it can handle a simple path with baseuri set to a full URL with a slash', () => {
        var path = Route.parse("https://hello.world/", paramsMap, "https://hello.world/settings");
        expect(path.length()).to.equal(1);
	});

	it('it can handle a simple path with baseuri set to a URL containing a full URL with a slash', () => {
        var path = Route.parse(new URL("https://hello.world/"), paramsMap, "https://hello.world/settings");
        expect(path.length()).to.equal(1);
	});

	it('it can handle a simple path with baseuri set to a full URL without a slash', () => {
        var path = Route.parse("https://hello.world", paramsMap, "https://hello.world/settings");
        expect(path.length()).to.equal(1);
	});

	it('it can handle a simple path with baseuri set to just a path', () => {
        var path = Route.parse("/servlet", paramsMap, "https://hello.world/servlet/settings");
        expect(path.length()).to.equal(1);
	});
});
