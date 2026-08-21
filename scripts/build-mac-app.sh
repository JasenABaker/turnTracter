#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> [1/5] Building frontend"
npm --prefix "$ROOT_DIR/frontend" install
npm --prefix "$ROOT_DIR/frontend" run build

echo "==> [2/5] Syncing frontend build into backend static resources"
rm -rf "$ROOT_DIR/backend/src/main/resources/static"
mkdir -p "$ROOT_DIR/backend/src/main/resources/static"
cp -R "$ROOT_DIR/frontend/dist/." "$ROOT_DIR/backend/src/main/resources/static/"

echo "==> [3/5] Building backend jar"
( cd "$ROOT_DIR/backend" && mvn -q clean package -DskipTests )

echo "==> [4/5] Copying jar into desktop resources"
mkdir -p "$ROOT_DIR/desktop/resources"
JAR_FILE=$(ls -t "$ROOT_DIR"/backend/target/*.jar | head -n1)
cp "$JAR_FILE" "$ROOT_DIR/desktop/resources/app.jar"

echo "==> [5/5] Packaging with electron-builder"
npm --prefix "$ROOT_DIR/desktop" install
npm --prefix "$ROOT_DIR/desktop" run dist

echo "Done. Output in desktop/release/"
