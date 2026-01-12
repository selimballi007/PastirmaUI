# Documentation Guide

This folder contains project documentation to help you (and Claude) work more effectively.

## 📁 What's in This Folder

| File | Purpose | When to Use |
|------|---------|-------------|
| **TROUBLESHOOTING.md** | Common errors and solutions | When you hit an error or bug |
| **ADR.md** | Architecture Decision Records | When making big technical decisions |
| **README.md** | This file - documentation guide | When you need to update docs |

## 📝 How to Maintain These Files

### Simple 3-Step Process

**When you encounter a problem and solve it:**

1. **Add to TROUBLESHOOTING.md**
   ```markdown
   ### ❌ Problem Title

   **Symptoms:** What you saw
   **Cause:** Why it happened
   **Solution:** How you fixed it
   ```

2. **That's it!** Just copy the pattern that's already there.

### When to Update Each File

#### TROUBLESHOOTING.md
**Update when:**
- ✅ You fix a bug that took more than 10 minutes to solve
- ✅ You encounter a confusing error message
- ✅ You find a solution that wasn't obvious
- ✅ Claude helped you fix something

**Don't update for:**
- ❌ Simple typos
- ❌ Obvious fixes
- ❌ One-time issues

**Example of when to add:**
```
You: "Why am I getting 404 on /api/review?"
Claude: "Backend route is /api/reviews (plural)"
You: [Add this to TROUBLESHOOTING.md under "API Endpoint Errors"]
```

#### ADR.md
**Update when:**
- ✅ You choose one approach over another (Zustand vs Redux)
- ✅ You make a decision that affects multiple files
- ✅ Future you might wonder "why did we do it this way?"
- ✅ There were trade-offs to consider

**Don't update for:**
- ❌ Small code changes
- ❌ Bug fixes
- ❌ Styling decisions

**Example of when to add:**
```
Decision: "Should we use Server Components or Client Components for the product list?"
Choose: Server Components for better SEO
→ Add ADR-008 explaining this decision
```

## ✍️ How to Write Good Documentation

### Use Templates

Both files have templates at the bottom - just copy and fill in!

**For TROUBLESHOOTING.md:**
```markdown
### ❌ Your Error Title Here

**Symptoms:**
What error messages did you see?

**Cause:**
Why did this happen?

**Solution:**
Step-by-step fix
```

**For ADR.md:**
```markdown
## ADR-XXX: Decision Title

**Date:** 2026-01-08
**Status:** ✅ Accepted

### Context
Why did we need to decide?

### Decision
What did we decide?

### Rationale
Why this way?

### Consequences
- ✅ Good things
- ⚠️ Trade-offs
```

### Keep It Simple

**Good example:**
```markdown
### ❌ JWT Token Expires Early

**Symptoms:** Users get logged out after 15 minutes even though config says 30

**Cause:** Cookie expiration hardcoded to 15 minutes

**Solution:** Read from configuration instead:
\`\`\`csharp
var expires = _configuration.GetValue<int>("Jwt:AccessTokenExpiresMinutes");
\`\`\`
```

**Too complicated:**
```markdown
### ❌ Authentication System Architectural Overview and Deep Dive Into Token Validation Mechanisms

[5 pages of detailed explanation...]
```

**Remember:** Future you just needs to remember "oh yeah, that's the cookie expiration thing!"

## 🔄 Workflow for Updating Docs

### After You Fix Something with Claude:

1. **Problem solved?** ✅
2. **Was it tricky?** (took >10 min or wasn't obvious)
   - YES → Add to TROUBLESHOOTING.md
   - NO → You're done!

3. **Did you make an architectural decision?**
   - YES → Add to ADR.md
   - NO → You're done!

### Example Session:

```
[You work with Claude to fix mobile access issue]

After fix:
1. Open TROUBLESHOOTING.md
2. Find "Mobile Access Issues" section
3. Add your specific error and solution
4. Save
5. Done! (Total time: 2 minutes)
```

## 🎯 Quick Reference

**I just fixed a bug → Where do I document it?**
- Add to **TROUBLESHOOTING.md**

**I made a big decision (e.g., chose a library) → Where do I document it?**
- Add to **ADR.md**

**I want to help Claude understand the project better → What do I update?**
- Update **CLAUDE.md** (in project root)

**I want to remember the fix → Which file?**
- **TROUBLESHOOTING.md**

**I want to remember why we did it this way → Which file?**
- **ADR.md**

## 💡 Pro Tips

### 1. Update Right Away
Document while it's fresh in your mind! Don't wait until later.

### 2. Use Search
Both files have Table of Contents. Use Ctrl+F to find related sections.

### 3. Copy Existing Patterns
Just copy a similar entry and modify it. Don't start from scratch!

### 4. Add File Paths
Always include file paths when relevant:
```markdown
**File:** `app/lib/api/client.ts:142`
```

### 5. Link Between Docs
```markdown
**See also:** ADR-003 for why we use user secrets
**Related:** TROUBLESHOOTING.md "Configuration Issues"
```

### 6. Ask Claude to Help
```
"Claude, I just fixed the category caching issue.
Help me add this to TROUBLESHOOTING.md"
```

## 📚 Other Important Docs

**In project root:**
- **CLAUDE.md** - Main guide for Claude (patterns, architecture, conventions)
- **README.md** - Project overview and setup (for humans)

**In backend:**
- **SECRETS-SETUP.md** - Complete configuration guide
- **appsettings.Template.json** - Configuration structure

## 🆘 When in Doubt

**Ask yourself:**
1. "Would future me want to know this?"
2. "Would this save someone 10+ minutes?"
3. "Is this non-obvious?"

If YES to any → Document it!

If NO to all → Skip it!

## 🚀 That's It!

Documentation doesn't have to be hard. Just:
1. Copy existing pattern
2. Fill in your situation
3. Save

**You're doing great!** Every little note helps future you and future team members. 🎉

---

## Questions?

**"Do I really need to do this?"**
Not required, but super helpful! Each update takes ~2 minutes and saves hours later.

**"What if I write it wrong?"**
There's no wrong way! Any documentation is better than none.

**"Can Claude help me write this?"**
Absolutely! Just say: "Claude, help me document this fix in TROUBLESHOOTING.md"

**"What if the docs get out of date?"**
Better to have somewhat outdated docs than no docs. Update when you notice it's wrong.
