#!/usr/bin/env bash
set -e

echo "Installing remote dependencies"
(cd remote && rm -rf node_modules)
for i in {1..5}; do # try 5 times
  yarn --verbose --cwd remote --frozen-lockfile --check-files && break
  if [ $i -eq 3 ]; then
    echo "Yarn failed too many times" >&2
    exit 1
  fi
  echo "Yarn failed $i, trying again..."
done

echo "Installing distro dependencies"
for i in {1..5}; do # try 5 times
  yarn --verbose --cwd .build/distro/npm --frozen-lockfile --check-files && break
  if [ $i -eq 3 ]; then
    echo "Yarn failed too many times" >&2
    exit 1
  fi
  echo "Yarn failed $i, trying again..."
done
