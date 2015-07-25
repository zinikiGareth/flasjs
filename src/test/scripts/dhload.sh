#!/bin/sh

if [ $# -eq 0 ] ; then
  echo 'Usage: $0 counter|chaddy|d3 ...' >&2
  exit 1
fi

COUNTER=0
CHADDY=0
D3=0
for i in "$@" ; do
  case $i in
    counter) COUNTER=1;;
    chaddy) CHADDY=1;;
    d3) D3=1;;
    *)
      echo "Unrecognized app: $i" >&2
      exit 1
  esac
done

# Upload 'counter'
if [ $COUNTER = 1 ] ; then
	scp src/test/javascript/{builtin,dom,flenv}.js ../FLAS2/src/test/resources/cards/test.ziniki/test.ziniki.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/counterDemo/javascript
	scp src/test/javascript/flasck/*.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/counterDemo/javascript/flasck
	sed \
	  -e 's%\.\.[./]*/javascript%javascript%' \
	  -e 's%\.\./.*test\.ziniki/%javascript/%' \
	  src/test/html/counter.html > /tmp/index.html
	scp /tmp/index.html gmmapowell@dh.flasck.net:dh.flasck.net/demos/counterDemo
fi

# Upload 'chaddy'
if [ $CHADDY = 1 ] ;then
	sed \
	  -e 's%\.\./images%images%' \
	  ../FLAS2/src/test/resources/cards/com.helpfulsidekick.chaddy/com.helpfulsidekick.chaddy.js > /tmp/com.helpfulsidekick.chaddy.js
	scp src/test/javascript/{builtin,dom,flasck/*,flenv,stdlib,atmosphere,loader,zinc}.js /tmp/com.helpfulsidekick.chaddy.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/chaddyDemo/javascript
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
fi

# Upload 'd3'
if [ $D3 = 1 ] ;then
	scp src/test/js/d3.v3.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/d3Demo/javascript
	scp src/test/javascript/{builtin,dom,flasck/*,flenv,stdlib}.js ../FLAS2/src/test/resources/cards/test.ziniki.d3/test.ziniki.d3.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/d3Demo/javascript
	scp src/test/javascript/flasck/*.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/d3Demo/javascript/flasck
	sed \
	  -e 's%\.\./js%javascript%' \
	  -e 's%\.\.[./]*/javascript%javascript%' \
	  -e 's%\.\.[./]*/css%css%' \
	  -e 's%\.\./.*test\.ziniki.d3/%javascript/%' \
	  src/test/html/d3test.html > /tmp/index.html
	scp /tmp/index.html gmmapowell@dh.flasck.net:dh.flasck.net/demos/d3Demo
fi

rm -f /tmp/index.html /tmp/com.helpfulsidekick.chaddy.js
