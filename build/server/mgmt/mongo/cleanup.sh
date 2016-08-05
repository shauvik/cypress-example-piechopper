#!/bin/sh
uname="undefined"
pword="undefined"
if test -n "$uname"; then
    uname="-u $uname"
fi
if test -n "$pword"; then
    pword="-p $pword"
fi
undefined/mongo $uname $pword localhost:undefined/undefined ./build/server/mgmt/mongo/cleanup.js
