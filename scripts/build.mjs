import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: [
	'src/main/javascript/runtime/appl.js',
  ],
  bundle: true,
  outfile: 'dist/core.js',
// 	'dist/core.js',
// 	'dist/unittest.js'
//   ],
  external: ['./src/main/resources/*', './src/main/javascript/unittest/*']
})

await esbuild.build({
  entryPoints: [
	'src/main/javascript/unittest/runner.js'
  ],
  bundle: true,
  outfile: 'dist/test.js',
// 	'dist/core.js',
// 	'dist/unittest.js'
//   ],
  external: ['./src/main/resources/*', './src/main/javascript/runtime/*']
})
