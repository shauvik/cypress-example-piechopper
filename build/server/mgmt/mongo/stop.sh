#!/bin/sh
mkdir -p undefined/run
pid=$(/sbin/pidof undefined/mongod)
if echo "$pid" | grep -q " "; then
  pid=""
fi
if [ -n "$pid" ]; then
  user=$(ps -p $pid -o user | tail -n 1)
  if [ $user = "" ]; then
    kill "$pid"
    rm -f undefined/run/mongod.pid
  fi
fi
