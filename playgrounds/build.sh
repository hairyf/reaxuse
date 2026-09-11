#!/usr/bin/env bash
# Build the playgrounds — mirrors VueUse's playgrounds/build.sh.
set -e
cd "$(dirname "$0")"

# Vite playground (primary)
cd ./vite
rm -rf node_modules
pnpm install
pnpm run build

# Next.js playground (needs the workspace packages built first:
# pnpm run build:packages at the repo root).
# cd ../next
# rm -rf node_modules
# pnpm install
# pnpm run build
