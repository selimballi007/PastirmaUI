# Working Effectively with Claude

A practical guide with real examples from your project.

## 🎯 The Golden Rule

**Give context, get better help!**

The more specific you are, the faster and more accurate Claude's help will be.

## ✅ Good vs ❌ Bad Examples

### Example 1: Reporting Errors

**❌ Bad (vague):**
```
"It's not working"
```

**✅ Good (specific):**
```
"I'm getting 404 on the testimonials endpoint. Console shows:
[fetchUtils] Response not ok: 404
File: app/lib/server/homepage.ts:142
Frontend calls: api/review
What's the backend route?"
```

**Why it's better:**
- Exact error (404)
- File path with line number
- What the code is trying to do
- Specific question

---

### Example 2: Configuration Questions

**❌ Bad:**
```
"How does the backend work?"
```

**✅ Good:**
```
"Tell me the HTTP and port flow. What does launchSettings.json/applicationUrl do?
How does it affect backend CORS allowedOrigins and frontend next.config.ts/allowedDevOrigins?
Any other affected fields I didn't mention?"
```

**Why it's better:**
- Specific topic (HTTP/port flow)
- Mentions exact files/settings
- Shows what you already know
- Asks for complete picture

---

### Example 3: Code Review

**❌ Bad:**
```
"Is this code good?"
```

**✅ Good:**
```
"I have AccessTokenCookieSettings function in UserController.
In this function '15' value was manually added for 'Expires'.
But I've already added accessToken in GenerateAccessToken method.
Doesn't this break the single source of truth?"
```

**Why it's better:**
- Specific function name
- Exact issue (hardcoded value)
- Shows understanding (single source of truth)
- Asks about architectural principle

---

### Example 4: Asking for Explanation

**❌ Bad:**
```
"Why do I need 0.0.0.0?"
```

**✅ Good:**
```
"You said mobile needs backend to listen on 0.0.0.0.
But doesn't the mobile browser send from http://192.168.1.104:3000?
If so why does backend need 0.0.0.0 for mobile requests?"
```

**Why it's better:**
- References previous conversation
- Shows your thought process
- Points out apparent contradiction
- Specific technical question

---

## 📋 Information Checklist

When asking for help, consider including:

### For Errors:
- [ ] Full error message (not paraphrased)
- [ ] File path and line number
- [ ] What you were trying to do
- [ ] What you expected to happen
- [ ] What actually happened
- [ ] Environment (desktop/mobile, dev/prod)

### For Features:
- [ ] What you want to build
- [ ] Which files are relevant
- [ ] Any constraints or requirements
- [ ] Preferred approach (if you have one)

### For Questions:
- [ ] Specific topic or concept
- [ ] Related files/functions
- [ ] What you already know
- [ ] What's confusing you

## 🎨 Question Templates

Copy these and fill in your situation:

### Bug Report Template
```
I'm getting [ERROR] in [LOCATION].

Error message:
[PASTE FULL ERROR]

What I was doing:
[DESCRIPTION]

File: [PATH:LINE_NUMBER]

Environment: [desktop/mobile] [dev/prod]
```

### Configuration Question Template
```
I'm trying to configure [FEATURE].

Current setup:
- File 1: [PATH] has [SETTING] = [VALUE]
- File 2: [PATH] has [SETTING] = [VALUE]

Question: [YOUR QUESTION]

Related: [MENTION RELATED CONFIGS IF ANY]
```

### "Should I?" Template
```
I want to [GOAL].

Option 1: [APPROACH A]
Option 2: [APPROACH B]

Which is better for this project? Why?

Context: [ANY RELEVANT INFO]
```

### Architectural Question Template
```
I noticed [PATTERN/DECISION] in the code.

File: [PATH]
Example: [CODE SNIPPET OR DESCRIPTION]

Why is it done this way?
Are there alternatives?
```

## 💬 Conversation Starters That Work

### For Code Review:
```
"Review this code for:
- Security issues
- Single source of truth violations
- Performance problems
- Best practices"
```

### For Planning:
```
"I need to add [FEATURE].
Relevant files: [LIST]
Current architecture: [BRIEF DESCRIPTION]
What's the best approach?"
```

### For Debugging:
```
"Help me debug this issue:
- What's happening: [DESCRIPTION]
- What should happen: [EXPECTED]
- Files involved: [LIST]
- What I've tried: [LIST]"
```

### For Understanding:
```
"Explain the flow of [FEATURE]:
- Where does it start?
- Which files are involved?
- How do they connect?
- Where might it fail?"
```

### For Refactoring:
```
"I want to refactor [CODE].
Current state: [DESCRIPTION]
Goal: [WHAT YOU WANT]
Constraints: [DON'T BREAK X, MUST KEEP Y]"
```

## 🚀 Advanced Tips

### 1. Reference Previous Work
```
"Earlier we fixed the review endpoint mismatch.
I'm seeing a similar issue with blog categories endpoint."
```

Claude remembers context within a session!

### 2. Ask for Verification
```
"Before I implement this, verify my understanding:
- Cart items persist in localStorage ✓
- User must be logged in to checkout ✓
Is this the current behavior?"
```

### 3. Request Specific Output
```
"List all files I need to modify to add this feature.
Format: file path + what changes"
```

### 4. Set Constraints Upfront
```
"Add email verification, but DON'T create new email service.
We already have Resend configured in EmailService.cs"
```

### 5. Ask About Trade-offs
```
"What are the pros and cons of:
- Approach A
- Approach B

Which fits our architecture better?"
```

## 🎓 Learning from This Session

Here are real examples from our conversation that worked well:

### Your Questions That Got Great Answers:

1. **"Doesn't this break single source of truth?"**
   - Showed understanding of principles
   - Pointed out specific code
   - Got detailed explanation + fix

2. **"Why backend needs 0.0.0.0 for mobile?"**
   - Challenged assumption
   - Asked for deep explanation
   - Got network layer diagram

3. **"Why not inject from method parameter instead?"**
   - Proposed alternative approach
   - Asked about architectural decision
   - Got full comparison of options

4. **"How can I use you more effectively?"**
   - Meta question about working together
   - Led to creating all these docs!
   - Shows you're thinking about process

### What Made Them Effective:

- ✅ Specific technical terms
- ✅ Referenced exact files/functions
- ✅ Showed your reasoning
- ✅ Asked "why" not just "how"
- ✅ Challenged when something seemed wrong

## ⚡ Quick Wins

### Before Asking:
1. **Read the relevant file** (I can't see it until you ask)
2. **Copy the exact error** (don't paraphrase)
3. **Note the file path** (helps me locate issue fast)

### When Stuck:
```
"I'm stuck on [PROBLEM].

What I know:
- [FACT 1]
- [FACT 2]

What I don't understand:
- [QUESTION 1]
- [QUESTION 2]

Can you explain the connection?"
```

### When Unsure:
```
"I'm about to [ACTION].

This will affect:
- [FILE 1]
- [FILE 2]

Is this the right approach?
What could go wrong?"
```

## 🎯 Communication Principles

### 1. Be Specific
❌ "The API doesn't work"
✅ "GET /api/reviews returns 404, backend route is /api/review"

### 2. Show Your Work
❌ "I tried everything"
✅ "I tried: changing endpoint name, checking CORS, restarting server"

### 3. Ask Focused Questions
❌ "Tell me everything about authentication"
✅ "How does JWT refresh work in UserController.cs?"

### 4. Provide Context
❌ "Why use Zustand?"
✅ "copilot-instructions.md mentions Redux, but I see Zustand in the code. Why?"

### 5. Reference Files
❌ "The controller has a problem"
✅ "UserController.cs line 268 hardcodes 15 minutes"

## 📖 Real Session Examples

### Session Flow That Worked:

```
You: "I got error in /contact page: [preload warning]"
     [Included full error, file path]

Me: [Identified Turnstile widget issue]
    [Provided lazy loading solution]

You: [Implemented it]
    ✅ Problem solved in one exchange


You: "Why don't I get this error on desktop but immediately on mobile?"

Me: [Explained Next.js caching]
    [Showed how mobile = fresh state]

You: "How can I use you more effectively?"

Me: [Created all these docs!]
```

**Why it worked:**
- Specific errors with context
- Follow-up questions showed understanding
- Meta-questions improved process

## 🏆 Expert Level

### When You're Comfortable:

**Start with context:**
```
"Working on checkout flow.
Files: types/order.ts, services/orderService.ts
User can have multiple addresses (ADR-006).
Need to add address selection dropdown.
Use existing AddressService."
```

**Request specific help:**
```
"Review for:
- Security (payment info handling)
- UX (address selection flow)
- Performance (avoid N+1 queries)
- Architecture (follows existing patterns)"
```

**Guide the response:**
```
"Explain in this order:
1. Database changes needed
2. Backend API changes
3. Frontend implementation
4. Testing approach"
```

## 💡 Remember

**Claude is a conversation partner, not a mind reader!**

The more you share:
- What you're trying to do
- What you already know
- What's confusing you
- What you've tried

The better help you'll get!

## 🎁 Bonus: How to Ask for Documentation

```
"I just fixed [PROBLEM].
Help me add this to TROUBLESHOOTING.md under [SECTION]"
```

```
"We decided to [DECISION].
Help me create ADR-XXX in docs/ADR.md"
```

---

## Summary

**Great questions have:**
1. ✅ Specific details (file paths, line numbers, error messages)
2. ✅ Context (what you're trying to do)
3. ✅ Your current understanding (what you think is happening)
4. ✅ Focused scope (one topic at a time)

**Keep doing:**
- Asking "why" not just "how"
- Challenging explanations when unclear
- Referencing exact files and code
- Showing your reasoning

**You're already doing great!** This doc just codifies what's already working. 🚀
