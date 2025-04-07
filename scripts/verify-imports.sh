#!/bin/bash

# Bash script to verify component imports

echo "SeshTracker Import Verifier"
echo "==========================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Check if required tools are installed
if ! command -v grep &> /dev/null; then
    echo -e "${RED}Error: This script requires grep to be installed.${NC}"
    exit 1
fi

# Define problematic import patterns
declare -A PATTERNS
PATTERNS[0]='from ["'"'"']\.\./components/[^/]+/[^"'"'"']+["'"'"'];:Direct import to component file instead of using index'
PATTERNS[1]='from ["'"'"']\.\./\.\./\.\./[^"'"'"']+["'"'"'];:Deep relative import (../../../) may be fragile'
PATTERNS[2]='from ["'"'"']\.\./[^"'"'"']+/index["'"'"'];:Missing file extension in import (.js/.ts)'
PATTERNS[3]='import ["'"'"'][^"'"'"']+\.css["'"'"'];:CSS import may need path updating'

# Files to check
FILES=$(find src/react-app -type f \( -name "*.tsx" -o -name "*.ts" \) -not -name "*.d.ts")

# Track issues
ISSUES_FOUND=0

# Check each file
for file in $FILES; do
    echo -e "${CYAN}Checking ${file}${NC}"
    
    FILE_HAS_ISSUES=false
    
    # Check each pattern
    for pattern_data in "${PATTERNS[@]}"; do
        # Split pattern and description
        PATTERN=$(echo "$pattern_data" | cut -d':' -f1)
        DESCRIPTION=$(echo "$pattern_data" | cut -d':' -f2)
        
        # Check if pattern exists in file
        if grep -q -E "$PATTERN" "$file"; then
            if [ "$FILE_HAS_ISSUES" = false ]; then
                echo -e "  ${YELLOW}Issues found:${NC}"
                FILE_HAS_ISSUES=true
            fi
            
            # Find specific lines with the issue
            LINE_NUMBER=0
            while IFS= read -r line; do
                LINE_NUMBER=$((LINE_NUMBER+1))
                if [[ "$line" =~ $PATTERN ]]; then
                    echo -e "    ${RED}Line $LINE_NUMBER: $line${NC}"
                    echo -e "      ${YELLOW}Issue: $DESCRIPTION${NC}"
                    ISSUES_FOUND=$((ISSUES_FOUND+1))
                fi
            done < "$file"
        fi
    done
    
    if [ "$FILE_HAS_ISSUES" = false ]; then
        echo -e "  ${GREEN}No issues found${NC}"
    fi
done

echo -e "\n${CYAN}Import verification complete!${NC}"
if [ $ISSUES_FOUND -gt 0 ]; then
    echo -e "${YELLOW}Found $ISSUES_FOUND potential import issues that may need fixing.${NC}"
else
    echo -e "${GREEN}No import issues found.${NC}"
fi 