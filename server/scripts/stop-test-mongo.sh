#!/bin/sh
set -eu

PIDFILE="/tmp/kinmel-vitest-mongod.pid"

if [ ! -f "$PIDFILE" ]; then
  exit 0
fi

PID="$(cat "$PIDFILE")"

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
fi

rm -f "$PIDFILE"
