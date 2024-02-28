import * as esbuild from 'esbuild'

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
	bundle: true,
	format: 'esm',
	outfile: 'dist/flaslive.js',
	external: ['./src/main/resources/*', './src/main/javascript/runtime/*']
  })
  