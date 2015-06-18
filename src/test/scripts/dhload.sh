#!/bin/sh

# Upload 'counter'
scp src/test/javascript/{builtin,dom,flenv}.js ../FLAS2/src/test/resources/cards/test.ziniki/test.ziniki.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/counterDemo/javascript
scp src/test/javascript/flasck/*.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/counterDemo/javascript/flasck
sed \
  -e 's%\.\.[./]*/javascript%javascript%' \
  -e 's%\.\./.*test\.ziniki/%javascript/%' \
  src/test/html/counter.html > /tmp/index.html
scp /tmp/index.html gmmapowell@dh.flasck.net:dh.flasck.net/demos/counterDemo

# Upload 'chaddy'
sed \
  -e 's%\.\./images%images%' \
  ../FLAS2/src/test/resources/cards/com.helpfulsidekick.chaddy/com.helpfulsidekick.chaddy.js > /tmp/com.helpfulsidekick.chaddy.js
scp src/test/javascript/{builtin,dom,flasck/*,flenv,stdlib}.js /tmp/com.helpfulsidekick.chaddy.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/chaddyDemo/javascript
scp src/test/javascript/flasck/*.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/chaddyDemo/javascript/flasck
scp src/test/css/*.css gmmapowell@dh.flasck.net:dh.flasck.net/demos/chaddyDemo/css
scp src/test/images/* gmmapowell@dh.flasck.net:dh.flasck.net/demos/chaddyDemo/images
sed \
  -e 's%\.\.[./]*/javascript%javascript%' \
  -e 's%\.\./.*\.chaddy/%javascript/%' \
  -e 's%\.\.[./]*/images%images%' \
  -e 's%\.\.[./]*/css%css%' \
  src/test/html/chaddy.html > /tmp/index.html
scp /tmp/index.html gmmapowell@dh.flasck.net:dh.flasck.net/demos/chaddyDemo
#cat /tmp/index.html
rm /tmp/index.html /tmp/com.helpfulsidekick.chaddy.js
