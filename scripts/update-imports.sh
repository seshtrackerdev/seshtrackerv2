#!/bin/bash

# Bash script to update component imports

echo "SeshTracker Import Path Updater"
echo "==============================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Check if required tools are installed
if ! command -v grep &> /dev/null || ! command -v sed &> /dev/null; then
    echo -e "${RED}Error: This script requires grep and sed to be installed.${NC}"
    exit 1
fi

# Files to process (React components)
FILES=$(find src/react-app/components -type f \( -name "*.tsx" -o -name "*.ts" \) -not -name "*.d.ts" -not -name "index.ts")

# Counter for statistics
TOTAL_FILES=0
UPDATED_FILES=0

for file in $FILES; do
    echo -e "${CYAN}Processing ${file}${NC}"
    TOTAL_FILES=$((TOTAL_FILES+1))
    
    # Create a backup just in case
    cp "$file" "${file}.bak"
    
    # Apply replacements using sed
    
    # From components root to category folders
    sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\/components\/([^"'"'"']+)["'"'"'];/import { \1 } from ".\/components";/g' "$file"
    sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\.\/components\/([^"'"'"']+)["'"'"'];/import { \1 } from "..\/components";/g' "$file"
    sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\.\/\.\.\/components\/([^"'"'"']+)["'"'"'];/import { \1 } from "..\/..\/components";/g' "$file"
    
    # Updating relative path imports in nested components
    sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\.\/hooks["'"'"'];/import { \1 } from "..\/..\/hooks";/g' "$file"
    sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\.\/contexts["'"'"'];/import { \1 } from "..\/..\/contexts";/g' "$file"
    sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\.\/styles\/([^"'"'"']+)["'"'"'];/import { \1 } from "..\/..\/styles\/\2";/g' "$file"
    sed -i.tmp -E 's/import[[:space:]]*["'"'"']\.\.\/styles\/([^"'"'"']+)["'"'"'];/import "..\/..\/styles\/\1";/g' "$file"
    
    # Update types imports
    sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\.\/types\/([^"'"'"']+)["'"'"'];/import { \1 } from "..\/..\/types";/g' "$file"
    sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\.\/\.\.\/types\/([^"'"'"']+)["'"'"'];/import { \1 } from "..\/..\/types";/g' "$file"
    
    # UI component special cases (these need to be preserved)
    # Only if not in the UI directory
    if [[ ! "$file" =~ "ui/" ]]; then
        sed -i.tmp -E 's/import[[:space:]]*\{?[[:space:]]*([^}]+)[[:space:]]*\}?[[:space:]]*from[[:space:]]*["'"'"']\.\/ui\/([^"'"'"']+)["'"'"'];/import { \1 } from "..\/ui\/\2";/g' "$file"
    fi
    
    # Check if file has changed
    if ! cmp -s "$file" "${file}.bak"; then
        echo -e "  ${GREEN}Updated imports${NC}"
        UPDATED_FILES=$((UPDATED_FILES+1))
    else
        echo -e "  ${GRAY}No changes needed${NC}"
    fi
    
    # Remove temporary files
    rm "${file}.tmp" 2>/dev/null
    rm "${file}.bak" 2>/dev/null
done

echo -e "\n${GREEN}Import paths update complete!${NC}"
echo -e "Processed $TOTAL_FILES files, updated $UPDATED_FILES files."
echo -e "${YELLOW}Remember to check for any specific imports that might need manual fixing.${NC}" 