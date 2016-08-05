#!/bin/sh
if test -n "undefined"; then
    mkdir -p undefined
    uname="undefined"
    pword="undefined"
    if test -n "$uname"; then
        uname="-u $uname"
    fi
    if test -n "$pword"; then
        pword="-p $pword"
    fi
    undefined/mongodump --port undefined $uname $pword --db undefined --out undefined/`date "+%Y-%m-%d--%H-%M-%S"`
fi
