#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1
lsof -ti:3000 | xargs -r kill -9 2>/dev/null
lsof -ti:4000 | xargs -r kill -9 2>/dev/null
lsof -ti:8000 | xargs -r kill -9 2>/dev/null
sleep 1
LOGDIR=/tmp
JSON_LOG=$LOGDIR/json-server.log
EXPRESS_LOG=$LOGDIR/express-server.log
SYNC_LOG=$LOGDIR/sync.log
PY_LOG=$LOGDIR/python-server.log
if command -v json-server >/dev/null 2>&1; then
    nohup json-server --watch "$DIR/db.json" --port 3000 > "$JSON_LOG" 2>&1 &
else
    nohup npx json-server --watch "$DIR/db.json" --port 3000 > "$JSON_LOG" 2>&1 &
fi
JSON_SERVER_PID=$!
if [ -d "$DIR/server" ] && [ -f "$DIR/server/server.js" ]; then
    nohup node "$DIR/server/server.js" > "$EXPRESS_LOG" 2>&1 &
    EXPRESS_PID=$!
else
    EXPRESS_PID=0
fi
if [ -f "$DIR/server/sync.js" ]; then
    nohup node "$DIR/server/sync.js" --watch > "$SYNC_LOG" 2>&1 &
    SYNC_PID=$!
else
    SYNC_PID=0
fi
nohup python3 -m http.server 8000 > "$PY_LOG" 2>&1 &
PY_PID=$!
echo $JSON_SERVER_PID > /tmp/bdtrip-json-server.pid
echo $EXPRESS_PID > /tmp/bdtrip-express-server.pid
echo $SYNC_PID > /tmp/bdtrip-sync.pid
echo $PY_PID > /tmp/bdtrip-python-server.pid
trap 'kill $(cat /tmp/bdtrip-json-server.pid 2>/dev/null) 2>/dev/null; kill $(cat /tmp/bdtrip-express-server.pid 2>/dev/null) 2>/dev/null; kill $(cat /tmp/bdtrip-sync.pid 2>/dev/null) 2>/dev/null; kill $(cat /tmp/bdtrip-python-server.pid 2>/dev/null) 2>/dev/null; rm -f /tmp/bdtrip-*.pid; exit 0' INT TERM
echo "Started: json-server(pid=$JSON_SERVER_PID) express(pid=$EXPRESS_PID) sync(pid=$SYNC_PID) python(pid=$PY_PID)"
echo "Logs: $JSON_LOG $EXPRESS_LOG $SYNC_LOG $PY_LOG"
wait
