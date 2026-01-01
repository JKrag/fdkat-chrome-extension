#!/bin/bash
# Package Chrome extension for Chrome Web Store upload
# Usage: ./scripts/package.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_DIR/build"
DIST_DIR="$PROJECT_DIR/dist"

# Get version from manifest.json
VERSION=$(grep '"version"' "$PROJECT_DIR/manifest.json" | sed 's/.*"version": "\([^"]*\)".*/\1/')
ZIP_NAME="kissatdb-addons-v${VERSION}.zip"

echo "Packaging KissatDB Add-ons v${VERSION}..."

# Create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$DIST_DIR"

# Copy extension files (excluding development files)
echo "Copying extension files..."
cp "$PROJECT_DIR/manifest.json" "$BUILD_DIR/"
cp "$PROJECT_DIR/sorter.js" "$BUILD_DIR/"
cp -r "$PROJECT_DIR/lib" "$BUILD_DIR/"
cp -r "$PROJECT_DIR/images" "$BUILD_DIR/"

# Create ZIP file
echo "Creating ZIP archive..."
cd "$BUILD_DIR"
zip -r "$DIST_DIR/$ZIP_NAME" . -x "*.DS_Store"

# Cleanup build directory
rm -rf "$BUILD_DIR"

echo ""
echo "Package created: dist/$ZIP_NAME"
echo "Size: $(du -h "$DIST_DIR/$ZIP_NAME" | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Upload to Chrome Developer Dashboard: https://chrome.google.com/webstore/devconsole"
echo "2. Or use: npm run publish (after setting up credentials)"
