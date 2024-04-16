import * as esbuild from 'esbuild'

let flasImportPathPlugin = {
	name: 'import-path',
	setup(build) {
	  build.onResolve({ filter: /ziwsh.js$/ }, args => {
		return { path: '/js/ziwsh.js', external: true }
	  })
	},
};
  
await esbuild.build({
  entryPoints: [
	'src/main/javascript/runtime/flasjs.js',
  ],
  bundle: true,
  format: 'esm',
  outfile: 'dist/flasjs.js',
  plugins: [ flasImportPathPlugin ],
  metafile: true
});

let liveImportPathPlugin = {
	name: 'import-path',
	setup(build) {
		build.onResolve({ filter: /\/runtime\// }, args => {
		return { path: '/js/flasjs.js', external: true }
	  })
	  build.onResolve({ filter: /ziwsh.js$/ }, args => {
		return { path: '/js/ziwsh.js', external: true }
	  })
	},
};
  
await esbuild.build({
  entryPoints: [
	'src/main/javascript/unittest/flastest.js'
  ],
  bundle: true,
  format: 'esm',
  outfile: 'dist/flastest.js',
  plugins: [ liveImportPathPlugin ],
});

await esbuild.build({
	entryPoints: [
	  'src/main/javascript/live/flaslive.js'
	],
	bundle: true,
	format: 'esm',
	outfile: 'dist/flaslive.js',
	plugins: [ liveImportPathPlugin ],
});

let javaImportPathPlugin = {
	name: 'import-path',
	setup(build) {
		build.onResolve({ filter: /\/runtime\// }, args => {
  			return { path: '/js/flasjs.js', external: true }
		})
		build.onResolve({ filter: /ziwsh/ }, args => {
			return { path: '/js/ziwsh.js', external: true }
	    })
		build.onResolve({ filter: /unittest/ }, args => {
			return { path: '/js/flastest.js', external: true }
	    })
	},
};

await esbuild.build({
	entryPoints: [
	  'src/main/javascript/forjava/wsbridge.js'
	],
	bundle: true,
	format: 'esm',
	outfile: 'dist/flasjava.js',
	plugins: [ javaImportPathPlugin ],
});
  