#!/bin/sh
pushd .
mkdir -p ./run
pid=$(/sbin/pidof ./bin/node)
if echo "$pid" | grep -q " "; then
  pid=""
fi
if [ -n "$pid" ]; then
  user=$(ps -p $pid -o user | tail -n 1)
  if [ $user = "" ]; then
    exit 0
  fi
fi
nohup ./bin/node ./build/server/src/server.js > /dev/null 2>&1 &
/sbin/pidof ./bin/node > ./run/node.pid
popd
