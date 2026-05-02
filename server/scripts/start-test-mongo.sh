#!/bin/sh
set -eu

DBPATH="/tmp/kinmel-vitest-db"
PIDFILE="/tmp/kinmel-vitest-mongod.pid"
LOGFILE="/tmp/kinmel-vitest-mongod.log"

mkdir -p "$DBPATH"

if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  exit 0
fi

rm -f "$PIDFILE"

mongod \
  --dbpath "$DBPATH" \
  --bind_ip 127.0.0.1 \
  --port 47017 \
  --logpath "$LOGFILE" \
  --pidfilepath "$PIDFILE" \
  --fork
