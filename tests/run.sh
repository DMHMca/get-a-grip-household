#!/usr/bin/env bash
# Runs the scripted-browser checks against this repository.
#   tests/run.sh               run every check
#   tests/run.sh -v            also print what each check printed
#   tests/run.sh devices-page  run just the named checks
# Needs: node, python3, and Playwright (npm install --no-save playwright; then npx playwright install chromium).
# Each check prints what it saw; a check FAILS if it crashes or if its "errors" line is not empty.
# Read the printed lines too: most checks print a result you should recognise (see the comment at the top of each file).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(dirname "$HERE")"
VERBOSE=0; NAMES=()
for a in "$@"; do if [ "$a" = "-v" ]; then VERBOSE=1; else NAMES+=("$a"); fi; done
WORK="$(mktemp -d)"; mkdir -p "$WORK/site" "$WORK/out"
ln -s "$REPO" "$WORK/site/get-a-grip-household"
node "$HERE/data/make.js" "$WORK/data"
python3 -m http.server 8765 --directory "$WORK/site" >/dev/null 2>&1 & SERVER=$!
trap 'kill $SERVER 2>/dev/null; rm -rf "$WORK"' EXIT
sleep 1
pass=0; fail=0
run() { # name, data
  local name="$1" data="$2" log="$WORK/$1.log"
  (cd "$WORK/out" && timeout 150 node "$HERE/checks/$name.js" ${data:+"$WORK/data/$data.md"} >"$log" 2>&1); local code=$?
  if [ $code -eq 0 ] && grep -q "^errors \[\]" "$log" || { [ "$name" = "worker-logic" ] && [ $code -eq 0 ]; }; then echo "PASS  $name"; pass=$((pass+1)); else echo "FAIL  $name (exit $code)"; fail=$((fail+1)); VERBOSE=1; fi
  if [ $VERBOSE -eq 1 ]; then sed 's/^/        /' "$log" | grep -v "^        \s*at " | head -40; fi
}
while IFS=: read -r name data; do
  [ -z "$name" ] && continue
  if [ ${#NAMES[@]} -gt 0 ]; then case " ${NAMES[*]} " in *" $name "*) ;; *) continue;; esac; fi
  run "$name" "$data"
done < "$HERE/index.txt"
echo; echo "$pass passed, $fail failed"
[ $fail -eq 0 ]
