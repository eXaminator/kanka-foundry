#!/bin/sh
# Builds the module and installs the production build into a Foundry instance's modules directory.
# Usage: FOUNDRY_MODULES_DIR=/path/to/Data/modules sh build/install-foundry.sh
# FOUNDRY_MODULES_DIR can also be set in .env.local (see .env.local.dist), the environment takes precedence.
set -eu

if [ -z "${FOUNDRY_MODULES_DIR:-}" ] && [ -f .env.local ]; then
    FOUNDRY_MODULES_DIR="$(sed -n 's/^FOUNDRY_MODULES_DIR=//p' .env.local | tail -n 1)"
fi

modules_dir="${FOUNDRY_MODULES_DIR:-}"
target="$modules_dir/kanka-foundry"

if [ -z "$modules_dir" ] || [ ! -d "$modules_dir" ] || [ ! -w "$modules_dir" ]; then
    echo "Foundry modules directory '$modules_dir' does not exist or is not writable (set FOUNDRY_MODULES_DIR, e.g. in .env.local)." >&2
    exit 1
fi

npm run build

mkdir -p "$target"
find "$target" -mindepth 1 -delete
cp -R dist/. "$target/"

# The release pipeline replaces __VERSION__; mark local builds as <package version>-dev instead.
node -e '
const fs = require("node:fs");
const file = process.argv[1];
const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
manifest.version = `${require("./package.json").version}-dev`;
fs.writeFileSync(file, `${JSON.stringify(manifest, null, 4)}\n`);
' "$target/module.json"

echo "Installed kanka-foundry $(node -p 'require(process.argv[1]).version' "$target/module.json") ($(du -sh "$target" | cut -f1)) into $target"
echo "Reload Foundry in the browser. Changes to module.json need the world to be relaunched."
