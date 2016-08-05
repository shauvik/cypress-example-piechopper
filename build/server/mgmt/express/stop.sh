#!/bin/sh
mkdir -p ./run
pid=$(/sbin/pidof ./bin/node)
if echo "$pid" | grep -q " "; then
  pid=""
fi
if [ -n "$pid" ]; then
  user=$(ps -p $pid -o user | tail -n 1)
  if [ $user = "" ]; then
    kill "$pid"
    rm -f ./run/node.pid
  fi
fi
