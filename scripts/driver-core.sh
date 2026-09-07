#!/usr/bin/env bash
# driver-core.sh — update each core PR branch with main, resolve index.ts,
# then merge the PR. Retries mergeable-staleness by re-running the update.
# Usage: driver-core.sh "<pr:worktreeDir> ..."
set -u
cd /d/reaxuse

merge_one() {
  local pr=$1 wt=$2
  for attempt in 1 2 3; do
    bash scripts/update-branch.sh "D:/reaxuse-wt/$wt" "feat/core-$wt" > /tmp/ub_$pr.log 2>&1
    local rc=$?
    if [ $rc -ne 0 ]; then
      echo "[$pr] update-branch FAILED (attempt $attempt): $(tail -1 /tmp/ub_$pr.log)"
      return 1
    fi
    gh pr merge "$pr" --repo hairyf/reaxuse --merge --delete-branch=false > /tmp/gh_$pr.log 2>&1
    if [ $? -eq 0 ]; then
      echo "[$pr] MERGED ($(grep -o 'PUSHED.*' /tmp/ub_$pr.log | tail -1))"
      return 0
    fi
    echo "[$pr] merge failed (attempt $attempt): $(tail -1 /tmp/gh_$pr.log)"
    sleep 3
  done
  echo "[$pr] GAVE UP after 3 attempts"
  return 1
}

# PR list in ascending order: "pr:worktreeDir"
PRS="321:usewindowscroll 322:usesupported 323:usewindowfocus 324:usetimestamp 325:usepreferredlanguages 326:usepreferredreducedtransparency 327:usevibrate 328:usepreferredreducedmotion 329:usepreferreddark 330:usepreferredcontrast2 331:usepreferredcolorscheme 333:usetitle 334:usetimeoutpoll 335:usetransition 336:usewindowsize 337:usetimeagointl 339:usetimeago 340:usesorted 341:usestatehistory 343:usestepper 344:usepermission 345:usetextdirection 346:useparentelement 347:usetextselection 349:usewakelock 350:useperformanceobserver 351:usewebnotification 352:usepointer 353:useresizeobserver 354:usescreensafearea 355:usepointerlock 356:usetemporalnow 357:usescripttag 358:useshare 359:usetextareaautosize 360:usestyletag 361:usesessionstorage 362:useswipe 363:usescrolllock 365:usespeechrecognition 367:usestorage"

for entry in $PRS; do
  pr=${entry%%:*}
  wt=${entry#*:}
  merge_one "$pr" "$wt"
done

echo "=== DONE ==="
