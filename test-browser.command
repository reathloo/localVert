#!/bin/zsh
set -eu

project_dir=${0:A:h}
cd -- "$project_dir"

port=$(python3 -c 'import socket; s = socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1]); s.close()')
python3 -m http.server "$port" --bind 127.0.0.1 >/dev/null 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT INT TERM

url="http://127.0.0.1:$port/index.html"
for attempt in {1..50}; do
  if ! kill -0 "$server_pid" 2>/dev/null; then
    print -u2 'Der lokale Testserver konnte nicht gestartet werden.'
    exit 1
  fi
  if curl --silent --fail "$url" >/dev/null; then
    print "Lokaler Test: $url"
    print 'Dieses Terminal offen lassen; Strg+C beendet den Testserver.'
    open -a Firefox "$url"
    wait "$server_pid"
    exit 0
  fi
  sleep 0.1
done

print -u2 'Der lokale Testserver antwortet nicht.'
exit 1
