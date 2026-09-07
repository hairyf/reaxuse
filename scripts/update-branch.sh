#!/usr/bin/env bash
# update-branch.sh <worktree-dir> <branch> [expect-added-line]
# Merge latest origin/main into the branch, resolve index.ts conflicts.
# All packages now use the placeholder pattern: index.ts pre-seeds
# "// export * from './X'" for unimplemented hooks; a PR's job is to
# uncomment its own line, never to insert a new export line. On conflict,
# --theirs (main) wins and the branch's added exports are re-applied by
# uncommenting the matching placeholder (append fallback if absent), then
# stale placeholders whose real export line already exists are removed.
set -u
WT=$1
BRANCH=$2
cd "$WT" || { echo "FAIL: cannot cd $WT"; exit 1; }

# Defensive: clear leftover merge state / stale staged changes from
# interrupted sessions — branch commits are already pushed, so no data loss.
git merge --abort 2>/dev/null
git reset --hard HEAD --quiet

git fetch origin main --quiet 2>/dev/null || { echo "FAIL: fetch $BRANCH"; exit 1; }

BASE=$(git merge-base origin/main HEAD)
CORE_ADDED=$(git diff "$BASE" HEAD -- packages/core/src/index.ts 2>/dev/null | grep '^+export ' | sed 's/^+//' || true)
SHARED_ADDED=$(git diff "$BASE" HEAD -- packages/shared/src/index.ts 2>/dev/null | grep '^+export ' | sed 's/^+//' || true)
MATH_ADDED=$(git diff "$BASE" HEAD -- packages/math/src/index.ts 2>/dev/null | grep '^+export ' | sed 's/^+//' || true)
INT_ADDED=$(git diff "$BASE" HEAD -- packages/integrations/src/index.ts 2>/dev/null | grep '^+export ' | sed 's/^+//' || true)

# Re-apply added exports to an index.ts by uncommenting placeholders.
# $1 = file, $2 = added export lines (newline-separated)
apply_added() {
  local f=$1 added=$2 name line
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    name=$(echo "$line" | sed -E "s|^export \* from './([^']+)'$|\1|")
    if grep -q "^// export \* from './$name'$" "$f"; then
      sed -i "s|^// export \* from './$name'$|export * from './$name'|" "$f"
    elif ! grep -q "^export \* from './$name'$" "$f"; then
      echo "WARN: no placeholder for $name in $(basename "$f") — appending"
      echo "export * from './$name'" >> "$f"
    fi
  done <<< "$added"
}

# Remove placeholder comment lines whose real export already exists.
# $1 = file
drop_stale_placeholders() {
  local f=$1 line name
  local tmp="${f}.drop"
  : > "$tmp"
  while IFS= read -r line; do
    case "$line" in
      "// export * from './"*)
        name=$(echo "$line" | sed -E "s|^// export \* from './([^']+)'$|\1|")
        if grep -q "^export \* from './$name'$" "$f"; then
          continue
        fi
        ;;
    esac
    echo "$line" >> "$tmp"
  done < "$f"
  mv "$tmp" "$f"
}

if git merge origin/main --no-edit >/dev/null 2>&1; then
  echo "CLEAN: $BRANCH"
  # Even on a clean merge, a PR branch created before the placeholder seed
  # may carry its own real export line while main now has the same
  # placeholder comment — drop the stale duplicate comment.
  drop_stale_placeholders packages/core/src/index.ts 2>/dev/null
  drop_stale_placeholders packages/shared/src/index.ts 2>/dev/null
  drop_stale_placeholders packages/math/src/index.ts 2>/dev/null
  drop_stale_placeholders packages/integrations/src/index.ts 2>/dev/null
  if [ -n "$(git diff --name-only -- packages/core/src/index.ts packages/shared/src/index.ts packages/math/src/index.ts packages/integrations/src/index.ts)" ]; then
    git add packages/core/src/index.ts packages/shared/src/index.ts packages/math/src/index.ts packages/integrations/src/index.ts
    git commit --no-edit >/dev/null 2>&1 || true
  fi
else
  CONFLICTS=$(git diff --name-only --diff-filter=U)
  echo "CONFLICTED: $BRANCH files=[$CONFLICTS]"
  for f in $CONFLICTS; do
    case "$f" in
      packages/core/src/index.ts|packages/shared/src/index.ts|packages/math/src/index.ts|packages/integrations/src/index.ts)
        pkg=$(basename "$(dirname "$(dirname "$f")")")
        case "$pkg" in
          core) added=$CORE_ADDED ;;
          shared) added=$SHARED_ADDED ;;
          math) added=$MATH_ADDED ;;
          integrations) added=$INT_ADDED ;;
        esac
        git checkout --theirs "$f" 2>/dev/null
        if [ -n "$added" ]; then
          apply_added "$f" "$added"
        fi
        drop_stale_placeholders "$f"
        ;;
      *)
        echo "FAIL: unexpected conflict file [$f] in $BRANCH"
        exit 1
        ;;
    esac
    git add "$f"
  done
  git commit --no-edit >/dev/null 2>&1 || { echo "FAIL: commit $BRANCH"; exit 1; }
fi

git push origin HEAD --quiet 2>&1 | tail -2
echo "PUSHED: $BRANCH -> $(git rev-parse --short HEAD)"
