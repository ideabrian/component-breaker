---
allowed-tools: Write, Read, Bash, Task
argument-hint: [milestone-name]
description: Ship a milestone with automatic documentation, git commit, and next moves generation
model: sonnet
---

# 🍄 Mario's Autonomous Shipping Protocol

Use the mario-jump-shipper agent to completely ship a milestone with zero manual work.

## Your Task

1. **Use the mario-jump-shipper agent** to execute complete milestone shipping
2. **Milestone name**: "$ARGUMENTS" (if provided, otherwise analyze current state)
3. **Autonomous actions you MUST take**:
   - Analyze current project state and recent accomplishments
   - Write MILESTONE.md with complete documentation
   - Update/create NextMoves.md with prioritized next steps
   - Create proper git commit with detailed message
   - Run any necessary builds
   - Update project status tracking

## Shipping Requirements

- **Write ALL files to disk** - Don't just show content, CREATE the files
- **Make real git commits** - Use actual git commands
- **Handle failures gracefully** - If something breaks, fix it and continue
- **Test functionality** - Verify files were created and builds work
- **Generate NextMoves.md** - Always end with what to do next
- **No permission asking** - Just deliver working results

## Success Criteria

- [ ] MILESTONE.md written to project root
- [ ] NextMoves.md updated with current priorities  
- [ ] Git commit created with proper message format
- [ ] Build completed (if build scripts exist)
- [ ] Project status updated
- [ ] All files tested and verified

## Mario's Philosophy

"Ship working, not perfect. Write files, not plans. Make commits, not excuses!"

Execute the shipping workflow autonomously and report what was accomplished.