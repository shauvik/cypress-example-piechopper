#!/bin/sh
mkdir -p undefined/run
pid=$(/sbin/pidof undefined/mongod)
if echo "$pid" | grep -q " "; then
  pid=""
fi
if [ -n "$pid" ]; then
  user=$(ps -p $pid -o user | tail -n 1)
  if [ $user = "" ]; then
    exit 0
  fi
fi
nohup undefined/mongod --auth --dbpath undefined --port undefined > /dev/null 2>&1 &
/sbin/pidof undefined/mongod > undefined/run/mongod.pid
