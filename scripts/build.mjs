import * as esbuild from 'esbuild'

let importPathPlugin = {
	name: 'import-path',
	setup(build) {
	  build.onResolve({ filter: /\/runtime\// }, args => {
		return { path: '/js/flasjs.js', external: true }
	  })
	  build.onResolve({ filter: /\/ziwsh$/ }, args => {
		return { path: '/js/ziwsh.js', external: true }
	  })
	},
  }
  
await esbuild.build({
  entryPoints: [
	'src/main/javascript/runtime/flasjs.js',
  ],
  bundle: true,
  format: 'esm',
  outfile: 'dist/flasjs.js',
  external: ['./src/main/resources/*']
})

await esbuild.build({
  entryPoints: [
	'src/main/javascript/unittest/flastest.js'
  ],
  bundle: true,
  format: 'esm',
  outfile: 'dist/flastest.js',
  external: ['./src/main/resources/*', './src/main/javascript/runtime/*']
})

await esbuild.build({
	entryPoints: [
	  'src/main/javascript/live/flaslive.js'
	],
	// alias: {
	// 	'../src/main/javascript/runtime/flasjs': '/js/flasjs',
	// },
	bundle: true,
	format: 'esm',
	outfile: 'dist/flaslive.js',
	plugins: [ importPathPlugin ],
	// external: ['./src/main/resources/*', './src/main/javascript/runtime/*']
  })
  