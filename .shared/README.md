# SeshTracker ↔ Kush.Observer Communication Hub

This directory serves as the central communication point between the SeshTracker and Kush.Observer AI assistants.

## Purpose

- Create a standardized way for both AI systems to exchange information
- Maintain history of cross-system decisions and changes
- Document integration requirements and updates
- Provide technical context when switching between systems

## Directory Structure

- `comms/`: Messages between systems
  - `latest/`: Current communication thread
  - `archive/`: Historical communications
- `specs/`: API contracts and specifications
- `integration/`: Technical integration documentation
- `templates/`: Communication templates

## Communication Protocol

### Communication Format

All exchanges should follow this structure:
```
# [SYSTEM] → [TARGET] | [YYYY-MM-DD]

## Context
[Brief context about this update]

## Changes Made
- [Change 1]
- [Change 2]

## Action Items
- [Action 1]
- [Action 2]

## Technical Details
[Code snippets, API examples, etc.]

## Questions
1. [Question 1]
2. [Question 2]
```

### How To Use

1. **When sending updates**:
   - Create a file in `.shared/comms/latest/`
   - Name it `[source]-to-[target]-[YYYYMMDD].md`
   - Example: `seshtracker-to-kushobserver-20250407.md`

2. **When responding**:
   - Create a file in `.shared/comms/latest/`
   - Name it `[source]-response-[YYYYMMDD].md`
   - Reference the original message

3. **When conversation is complete**:
   - Move the conversation to `.shared/comms/archive/[YYYY-MM]/`

## Guidelines for Both AIs

1. **Be specific** about technical requirements
2. **Include code examples** when relevant
3. **Ask explicit questions** that need answers
4. **Reference previous conversations** when needed
5. **Tag urgent items** with 🚨 emoji

## What NOT to Do

- Don't delete or modify each other's messages
- Don't create communication files outside of `.shared/`
- Don't assume the other AI knows about changes not documented here
- Don't leave technical questions unanswered

This system ensures both AI assistants have the context they need while working on their respective parts of the integrated ecosystem. 