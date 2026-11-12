#!/bin/bash
# Cloudflare Pages build: copy the published files into dist/.
# Leaves out hidden folders (.claude, .playwright-mcp) except .well-known (the phone app's link files), this scripts/ folder and the GitHub Pages CNAME file,
# which GitHub Pages never served either.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir dist
git ls-files | awk '!/^\./ || /^\.well-known\//' | grep -v '^scripts/' | grep -vx 'CNAME' | tar -cf - -T - | tar -xf - -C dist
echo "Copied $(find dist -type f | wc -l | tr -d ' ') files into dist/"
