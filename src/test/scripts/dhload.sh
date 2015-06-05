#!/bin/sh

scp src/test/javascript/{builtin,dom,flasck,flenv}.js ../../FLAS2/src/test/resources/cards/test.ziniki/counter.js gmmapowell@dh.flasck.net:dh.flasck.net/demos/counterDemo/javascript
sed \
  -e 's%\.\.[./]*/javascript%javascript%' \
  -e 's%\.\./.*test\.ziniki/%javascript/%' \
  src/test/html/counter.html > /tmp/index.html
scp /tmp/index.html gmmapowell@dh.flasck.net:dh.flasck.net/demos/counterDemo
