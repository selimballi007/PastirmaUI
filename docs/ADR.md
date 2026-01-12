# Architecture Decision Records (ADR)

This document tracks important architectural decisions made in the Pastirma project.

**Format:**
- **Date:** When decision was made
- **Status:** Accepted | Deprecated | Superseded
- **Context:** Why we needed to make a decision
- **Decision:** What we decided
- **Rationale:** Why this approach
- **Consequences:** What this means going forward

---

## ADR-001: Use Zustand Instead of Redux

**Date:** 2024 (early development)
**Status:** ✅ Accepted

### Context
Need client-side state management for authentication and shopping cart.

### Decision
Use **Zustand** instead of Redux for state management.

### Rationale
- **Simpler API:** No boilerplate, reducers, or actions
- **Better TypeScript support:** Full type inference out of the box
- **Smaller bundle size:** ~1KB vs Redux's ~20KB
- **Less code:** Direct state updates vs action/reducer pattern
- **Built-in devtools:** Support for Redux DevTools
- **Better for beginners:** Easier learning curve

### Consequences
- ✅ Faster development with less boilerplate
- ✅ Easier to understand for new team members
- ⚠️ `copilot-instructions.md` is outdated (mentions Redux)
- ✅ All new state should follow Zustand pattern
- ✅ Stores: `authStore.ts`, `cartStore.ts`, `categoryStore.ts`

### Files Affected
- `app/lib/store/*.ts`

---

## ADR-002: Dual-Image Architecture for Products

**Date:** 2024 (product feature development)
**Status:** ✅ Accepted

### Context
Products need images, but loading full galleries on list/card views hurts performance.

### Decision
Products have **two image fields**:
1. `imageUrl` (string) - Single main image
2. `images` (collection) - Full gallery

### Rationale
- **Performance:** List views only load one image per product
- **UX:** User explicitly chooses main image (no auto-assignment)
- **Flexibility:** Detail pages show full gallery
- **Database efficiency:** Don't query all images when only one needed

### Consequences
- ✅ Faster list/card rendering
- ⚠️ Main image must be set explicitly via star icon
- ⚠️ Deleting main image does NOT auto-assign from gallery
- ✅ Form validation prevents saving product without main image
- ⚠️ Must use functional setState to avoid race conditions during upload

### Implementation
```csharp
// Backend Entity
public class Product {
    public string ImageUrl { get; set; }  // Main image
    public ICollection<ProductImage> Images { get; set; }  // Gallery
}
```

### Files Affected
- `Core/Entities/Product.cs`
- `app/dashboard/products/[id]/page.tsx`

---

## ADR-003: All Configuration in User Secrets

**Date:** 2026-01-08
**Status:** ✅ Accepted

### Context
Configuration scattered across:
- `appsettings.json` (committed to git)
- `appsettings.Development.json` (local only)
- User secrets (secure)
- Hard-coded values in code

This made deployment error-prone and violated single source of truth.

### Decision
Move **ALL** application configuration to:
- **Development:** User Secrets (`dotnet user-secrets`)
- **Production:** Environment Variables

Only keep **logging configuration** in `appsettings.json`.

### Rationale
- **Security:** No secrets in git
- **Deployment checklist:** Can't forget to set values (they're required)
- **Single source:** One place to check for all config
- **Environment-specific:** Easy to change per environment
- **Documentation:** SECRETS-SETUP.md lists all required config

### Consequences
- ✅ Nothing can be forgotten during deployment
- ✅ No secrets committed to git
- ✅ All config in one place
- ⚠️ Must set 19+ environment variables for production
- ✅ Template file documents structure
- ✅ Validation at startup catches missing config

### Configuration Moved
- CORS origins
- JWT settings (Key, Issuer, Audience, expirations)
- Database connection
- Cloudinary credentials
- Email service credentials
- AllowedHosts
- Frontend URL

### Files Affected
- `Program.cs` - Reads from configuration
- `appsettings.json` - Only logging remains
- `appsettings.Template.json` - Documents structure
- `SECRETS-SETUP.md` - Setup guide

---

## ADR-004: Cookie Expiration from Configuration

**Date:** 2026-01-08
**Status:** ✅ Accepted

### Context
JWT access token expiration was set in configuration (`Jwt:AccessTokenExpiresMinutes`), but cookie expiration was hardcoded to `15` minutes in `UserController.cs`. This violated single source of truth.

If token expiration changed to 30 minutes, cookie would still expire in 15 minutes, logging users out prematurely.

### Decision
Read cookie expiration from same configuration value as JWT expiration.

### Rationale
- **Single source of truth:** One value controls both
- **Consistency:** Cookie and JWT expire together
- **Flexibility:** Change expiration in one place
- **No silent bugs:** Can't have mismatched expirations

### Consequences
- ✅ Cookie expiration always matches JWT expiration
- ✅ Change one value, both update
- ✅ Inject `IConfiguration` into controller
- ✅ More reliable authentication flow

### Implementation
```csharp
// Before (BAD - hardcoded)
Expires = DateTimeOffset.UtcNow.AddMinutes(15)

// After (GOOD - from config)
var expiresMinutes = _configuration.GetValue<int>("Jwt:AccessTokenExpiresMinutes");
Expires = DateTimeOffset.UtcNow.AddMinutes(expiresMinutes)
```

### Files Affected
- `API/Controllers/UserController.cs:AccessTokenCookieSettings()`

---

## ADR-005: TypeScript Types Centralization

**Date:** 2024 (ongoing refactor)
**Status:** ✅ Accepted

### Context
TypeScript types were scattered across:
- Component files
- Service files
- Store files
- Duplicated across multiple locations

This caused:
- Duplication
- Inconsistencies
- Hard to find types
- Merge conflicts

### Decision
Centralize **domain model types** in `app/types/` directory.

**What goes in types/:**
- ✅ Domain models (User, Product, Order, etc.)
- ✅ Shared interfaces used across multiple files
- ✅ Pure data structures (no functions)
- ✅ DTOs matching backend

**What stays local:**
- ❌ Component-specific props
- ❌ Zustand store state interfaces (implementation detail)
- ❌ Page-specific form data
- ❌ Functions or logic

### Rationale
- **Single source:** One place for each type
- **Reusability:** Import from central location
- **Consistency:** Types match across frontend and backend
- **Documentation:** Clear structure shows data model
- **Generic utilities:** Like `PagedResult<T>`

### Consequences
- ✅ Easy to find types
- ✅ No duplication
- ✅ Consistent naming
- ✅ Re-exports from services/stores for convenience
- ⚠️ Must decide: local vs centralized for new types

### Type Organization
```
app/types/
├── common.ts       # PagedResult<T>, utilities
├── user.ts         # User, UserProfile, Customer
├── product.ts      # Product, ProductImage, ProductDTO
├── order.ts        # Order, OrderItem, OrderStatus
├── cart.ts         # CartItem
├── category.ts     # Category, CategoryDTO
└── ...
```

### Files Affected
- All files in `app/types/`
- Services re-export types for convenience
- Stores re-export domain models

---

## ADR-006: Mobile Network Access Configuration

**Date:** 2026-01-08
**Status:** ✅ Accepted

### Context
Application only accessible via `localhost:3000`, which doesn't work on mobile devices (localhost refers to the device itself).

### Decision
Configure application to be accessible via LAN IP address (`192.168.1.104`) for mobile testing.

### Rationale
- **Testing:** Need to test on real mobile devices
- **Responsive design:** Must verify mobile UX
- **Network APIs:** Some features only work on real devices
- **Client demos:** Show progress on phones/tablets

### Consequences
- ✅ Mobile can access app at `http://192.168.1.104:3000`
- ✅ Desktop still works at `http://localhost:3000`
- ⚠️ Requires 4 configuration changes (see below)
- ⚠️ Production will use different URLs (HTTPS domains)

### Configuration Required

**1. Backend - Listen on all interfaces:**
```json
// launchSettings.json
"applicationUrl": "http://0.0.0.0:5296;http://localhost:5296"
```

**2. Backend - CORS for IP address:**
```bash
dotnet user-secrets set "CorsSettings:AllowedOrigins:1" "http://192.168.1.104:3000"
```

**3. Frontend - API URL:**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://192.168.1.104:5296/api/
```

**4. Frontend - Allow cross-origin:**
```typescript
// next.config.ts
allowedDevOrigins: ['192.168.1.104']  // hostname only!
```

### Files Affected
- `Properties/launchSettings.json`
- `Program.cs` (CORS from user secrets)
- `.env.local`
- `next.config.ts`

### Related Documentation
See: TROUBLESHOOTING.md "Mobile Access Issues"

---

## ADR-007: CategoryStore Pattern

**Date:** 2024
**Status:** ✅ Accepted

### Context
Categories fetched multiple times across different pages, causing:
- Redundant API calls
- Inconsistent data
- Poor UX (loading spinners everywhere)

### Decision
Create centralized `categoryStore` with:
- **5-minute cache:** Avoid unnecessary API calls
- **localStorage persistence:** Survive page refreshes
- **Single source:** All components use same store

### Rationale
- **Performance:** Reduce API calls from 10+ to 1 per 5 minutes
- **Consistency:** All pages see same data
- **UX:** Instant category loading after first fetch
- **Offline:** Categories available from localStorage

### Consequences
- ✅ Must use `useCategoryStore()` - never fetch directly
- ✅ Cache auto-refreshes every 5 minutes
- ✅ Use `refreshCategories()` to force update
- ✅ Persists across page reloads
- ⚠️ All developers must know to use store

### Usage
```typescript
const { categories, fetchCategories, loading } = useCategoryStore();

useEffect(() => {
    fetchCategories(); // Uses cache if valid
}, [fetchCategories]);
```

### Files Affected
- `app/lib/store/categoryStore.ts`

---

## ADR-008: Partial Refactor of auth.ts to Use serverFetchAPI

**Date:** 2026-01-10
**Status:** ⚠️ Partially Superseded by ADR-010
**Note:** Analysis was based on frontend code only. ADR-010 corrects this by analyzing actual backend implementation.

### Context

`app/lib/actions/auth.ts` contains 8 Server Actions with repetitive `fetch` calls. Each action manually constructs URLs, sets headers, handles responses, and parses errors - resulting in ~90 lines of duplicated code.

We have a `serverFetchAPI<T>` utility (`app/lib/server/api.ts`) designed for server-side API calls, but it's not used in auth actions.

### Decision

**Partially refactor** auth.ts to use existing utilities:
- **Refactor 2 simple actions** to use `serverFetchAPI` (actions without special error handling)
- **Keep 3 authentication actions** as-is (manual cookie management required)
- **Keep 3 validation-heavy actions** as-is (need status code checking)

### Rationale

**Why not refactor all 8?**

1. **Cookie Management Complexity** (3 actions):
   - `loginAction`, `logoutAction`, `refreshTokenAction`
   - Manually parse `Set-Cookie` headers and set cookies
   - Build `Cookie` headers to send
   - `serverFetchAPI` doesn't handle cookie operations

2. **Status Code-Specific Logic** (3 actions):
   - `registerAction`, `forgotPasswordAction`, `resetPasswordAction`, `verifyEmailAction`
   - Check specific status codes (400, 404, 504)
   - Different responses based on status
   - `serverFetchAPI` throws on error, losing status info

3. **Simple Actions** (2 actions) ✅ **Can refactor:**
   - `resendVerificationAction`, `resendVerificationByTokenAction`
   - Generic error handling, no status checking
   - Perfect candidates for `serverFetchAPI`

**Why partial refactor is best:**
- ✅ Quick win with low risk
- ✅ Eliminates ~30 lines of duplication
- ✅ Leaves complex logic explicit (easier to debug)
- ✅ Can improve later if needed (Option 2: create `authFetchAPI`)

### Consequences

**Benefits:**
- ✅ Reduced duplication (~30 lines removed)
- ✅ Consistent error handling for simple actions
- ✅ Uses shared utilities
- ✅ Easy to implement (< 30 min)

**Trade-offs:**
- ⚠️ Still have 6 actions with manual fetch
- ⚠️ Two different patterns in same file
- ⚠️ Future auth actions need guidance on which pattern to use

**Future improvements:**
- Consider creating `authFetchAPI` helper if more auth actions added
- Could enhance `serverFetchAPI` with optional status code access
- Document which pattern to use for new actions

### Implementation

**Before (resendVerificationAction):**
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/resend-verification-bye`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email: email, captchaToken }),
    credentials: 'include',
});

if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    // ... error handling
}
return { success: true, message: "..." };
```

**After:**
```typescript
try {
    await serverFetchAPI('user/resend-verification-bye', {
        method: 'POST',
        body: JSON.stringify({ Email: email, captchaToken }),
    });
    return { success: true, message: "..." };
} catch (error: any) {
    return {
        success: false,
        message: error.message || "Hata oluştu.",
    };
}
```

### Files Affected
- `app/lib/actions/auth.ts` - Refactored 2 actions
- `app/lib/server/api.ts` - Used by refactored actions

### Related Documentation
- **ADR-010: Backend Error Architecture Discovery** - Corrects this ADR's analysis and extends refactoring to 6 actions (not 2)
- ADR-009: Logout Pattern (Server Action + Client Hook)
- CLAUDE.md: "Things to NEVER Do" - avoid code duplication

---

## ADR-009: Logout Pattern - Server Action + Client Hook

**Date:** 2026-01-10
**Status:** ✅ Accepted

### Context

Logout requires both server-side operations (delete cookies, call backend) and client-side operations (clear Zustand store, redirect). This creates potential for code duplication if components handle logout logic directly.

Two implementations exist:
1. `logoutAction` (Server Action) in `app/lib/actions/auth.ts`
2. `useAuthActions().logOut` (Client Hook) in `app/lib/hooks/useAuth.ts`

Question: Is this duplication, or proper layering?

### Decision

**Keep both** - this is proper separation of concerns, NOT duplication.

Use **layered logout pattern:**
- **Server Action (`logoutAction`)**: Handles server-side concerns
- **Client Hook (`useAuthActions().logOut`)**: Handles client-side concerns + calls Server Action
- **Components**: Use hook ONLY, never call Server Action directly

### Rationale

**Why Server Action alone isn't enough:**
- ❌ Cannot clear Zustand store (server has no access to client state)
- ❌ Cannot redirect (server has no access to Next.js router)
- ❌ Components would repeat client-side logic everywhere

**Why Client Hook alone isn't enough:**
- ❌ Cannot delete HTTP-only cookies (browser security restriction)
- ❌ Would expose backend call logic in client
- ❌ Cannot handle cookie operations securely

**Why layered approach works:**
- ✅ Each layer handles what it's best at
- ✅ Server Action reusable from multiple places
- ✅ Client Hook provides clean component API
- ✅ Follows separation of concerns

### Consequences

**Benefits:**
- ✅ Clear separation of server/client responsibilities
- ✅ Components have simple, consistent logout API
- ✅ Server logic isolated and testable
- ✅ Client logic isolated and testable
- ✅ Easy to add logging/analytics in one place

**Rules:**
- ✅ **Components MUST use hook:** `const { logOut } = useAuthActions();`
- ❌ **Components MUST NOT call action directly:** `await logoutAction()`
- ✅ **New auth features follow same pattern**

**Documentation needed:**
- Add comments explaining pattern
- Document in CLAUDE.md
- Guide future developers

### Implementation

**Layer 1: Server Action (Server-side concerns)**
```typescript
// app/lib/actions/auth.ts
// ⚠️ DO NOT call directly from components - use useAuthActions hook
export async function logoutAction(): Promise<{ success: boolean }> {
    // 1. Call backend logout
    await fetch(`${API_URL}/user/logout`, { ... });

    // 2. Delete HTTP-only cookies
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return { success: true };
}
```

**Layer 2: Client Hook (Client-side concerns)**
```typescript
// app/lib/hooks/useAuth.ts
// ✅ Components should use THIS
export const useAuthActions = () => {
    const router = useRouter();
    const logoutStore = useAuthStore(state => state.logout);

    const logOut = useCallback(async () => {
        // 1. Server-side operations
        await logoutAction();

        // 2. Clear client state
        logoutStore();

        // 3. Redirect
        router.push('/');
    }, [logoutStore, router]);

    return { logOut };
};
```

**Layer 3: Component Usage**
```typescript
// ✅ CORRECT
import { useAuthActions } from '@/app/lib/hooks/useAuth';

function Header() {
    const { logOut } = useAuthActions();
    return <button onClick={logOut}>Logout</button>;
}

// ❌ WRONG - Don't call Server Action directly
import { logoutAction } from '@/app/lib/actions/auth';

function Header() {
    const handleLogout = async () => {
        await logoutAction(); // Missing client-side logic!
        // Now you have to repeat Zustand + router logic here
    };
    return <button onClick={handleLogout}>Logout</button>;
}
```

### Files Affected
- `app/lib/actions/auth.ts:689` - Server Action (DO NOT call directly)
- `app/lib/hooks/useAuth.ts:20` - Client Hook (components use this)

### Related Documentation
- ADR-008: Partial Refactor of auth.ts
- CLAUDE.md: "Authentication Flow" section

---

## ADR-010: Backend Error Architecture Discovery & Frontend Simplification

**Date:** 2026-01-10
**Status:** ✅ Accepted
**Supersedes:** ADR-008 (partial superseding - corrects analysis)

### Context

ADR-008 recommended a **partial refactor** of auth.ts, keeping 6 actions with manual fetch because they appeared to need status code checking (400, 404, 504). This was based on **frontend code analysis** without verifying the actual backend implementation.

User requested: *"Review error codes by checking backend UserController.cs. Can we make auth.ts more compact?"*

This led to analyzing the **actual backend error handling architecture**.

### Discovery: Backend Error Handling

After reading `C:\Projects\Pastirma\PastirmaApi`, we discovered:

**Error Flow:**
```
Service throws exception → ErrorHandlingMiddleware → Sets StatusCode → Returns JSON
```

**Exception Types (Core/Exceptions/):**
```csharp
// All inherit from BaseException with StatusCode property
- AuthException       → 400 (default)
- BusinessException   → 400 (default)
- NotFoundException   → 404 (default)
```

**Middleware (API/Middlewares/ErrorHandlingMiddleware.cs):**
```csharp
catch (BaseException ex) {
    context.Response.StatusCode = ex.StatusCode;
    await context.Response.WriteAsJsonAsync(new { errors = new[] { ex.Message } });
}
```

**Captcha (API/Middlewares/CaptchaMiddleware.cs):**
- Uses **Cloudflare Turnstile** (not Google reCAPTCHA)
- **Development mode: SKIPS validation entirely!**
- Production mode: Always returns **400** with generic message
- No special status codes for captcha failures

**Reality Check: Status Codes Used in Auth Endpoints**

| Endpoint | Possible Status Codes | Notes |
|----------|---------------------|-------|
| `/register` | 400 | Email exists (AuthException) |
| `/login` | 400, **504** | 504 = Email not verified ✅ **ONLY 504 in all auth!** |
| `/verify-email` | 400 | Token invalid, user not found |
| `/resend-verification-byt` | 400 | Token invalid |
| `/resend-verification-bye` | 400 | User not found (but returns success anyway) |
| `/forgot-password` | 200 | **NEVER throws** (security by design) |
| `/reset-password` | 400 | Token invalid, user not found |
| `/refresh-token` | 400 | Invalid tokens |

**Key Finding: NO endpoint returns 404!**
- Frontend checks for 404 are **dead code**
- Backend uses `BusinessException(message, 400)` for "not found" errors
- Only `loginAction` uses 504 for unverified email

### Decision

**Refactor 6 actions to use `serverFetchAPI`** (not just 2):

✅ **Simple actions** (already done in ADR-008):
1. `resendVerificationAction`
2. `resendVerificationByTokenAction`

✅ **Status-checking actions** (NEWLY REFACTORABLE):
3. `registerAction` - Frontend checks 400+captcha, backend only returns 400
4. `forgotPasswordAction` - Frontend checks captcha, backend never throws
5. `resetPasswordAction` - Frontend checks 400/404/504, backend only returns 400
6. `verifyEmailAction` - Frontend checks 400/404/504, backend only returns 400

❌ **Keep manual** (cookie management + special status code):
1. `loginAction` - **504 check** for unverified email + cookie parsing
2. `logoutAction` - Cookie deletion
3. `refreshTokenAction` - Cookie parsing and setting

### Rationale

**Why frontend had unnecessary status checks:**

1. **Defensive Programming Gone Wrong:**
   - Frontend developers added status code checks "just in case"
   - Backend was never consulted
   - Code evolved separately from backend reality

2. **Captcha Message Checking:**
   ```typescript
   // Frontend checks
   if (res.status === 400 && errorData?.message?.includes('captcha'))

   // Backend reality (CaptchaMiddleware)
   context.Response.StatusCode = 400;
   await context.Response.WriteAsJsonAsync(new {
       errors = new[] { "Captcha doğrulaması başarısız" }
   });
   ```
   - Checking `message.includes('captcha')` is fragile
   - Development mode skips captcha entirely
   - Better to just return `error.message` from catch block

3. **404 Checks That Never Trigger:**
   ```typescript
   // Frontend
   if (res.status === 400 || res.status === 404) // 404 NEVER happens!

   // Backend
   throw new BusinessException("Kullanıcı bulunamadı"); // Always 400
   ```

**Why serverFetchAPI is now safe:**

```typescript
// serverFetchAPI throws on error with error.message
try {
    await serverFetchAPI('user/register', { ... });
    return { success: true, message: "..." };
} catch (error: any) {
    // error.message contains backend's descriptive message
    return { success: false, message: error.message || "Hata oluştu." };
}
```

Backend provides **descriptive error messages**, so status code checking is redundant:
- "Bu email zaten kayıtlı"
- "Link geçersiz veya süresi dolmuş"
- "Kullanıcı bulunamadı"
- "Captcha doğrulaması başarısız"

### Consequences

**Benefits:**
- ✅ **~218 lines of code eliminated** (4 actions × ~54 lines each)
- ✅ **Frontend aligned with backend reality**
- ✅ **Simpler error handling** - just return error.message
- ✅ **More maintainable** - backend controls all error messages
- ✅ **Development experience improved** - captcha skipped in dev mode

**Removed dead code:**
- ❌ 404 status checks (never triggered)
- ❌ 504 status checks in reset/verify (never triggered)
- ❌ Captcha message string matching (fragile)

**Trade-offs:**
- ⚠️ Frontend relies on backend error messages (acceptable - single source of truth)
- ⚠️ Can't distinguish error types by status code (not needed - messages are descriptive)

**What stays manual:**
- `loginAction` - Still needs 504 check for `showResend: true` flag
- Cookie management actions - Can't use serverFetchAPI

### Implementation

**Before (registerAction - 51 lines):**
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email, UserName, PasswordHash, captchaToken }),
    credentials: 'include',
});

if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    // ReCAPTCHA verification failed in .NET
    if (res.status === 400 && errorData?.message?.includes('captcha')) {
        return { success: false, message: "ReCAPTCHA doğrulaması başarısız..." };
    }

    // Backend validation errors
    if (errorData?.errors) {
        return { success: false, errors: errorData.errors };
    }

    return { success: false, message: errorData?.message || "Kayıt başarısız..." };
}

return { success: true, message: "✅ Hesabınızı email ile aktifleştirebilirsiniz." };
```

**After (13 lines):**
```typescript
try {
    await serverFetchAPI('user/register', {
        method: 'POST',
        body: JSON.stringify({
            Email: email,
            UserName: username,
            PasswordHash: password,
            captchaToken
        }),
    });

    return {
        success: true,
        message: "✅ Hesabınızı email adresinize gönderilen linkten aktifleştirebilirsiniz. Gelen klasöründe yoksa Spam klasörünü kontrol ediniz."
    };
} catch (error: any) {
    return {
        success: false,
        message: error.message || "❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    };
}
```

**Code reduction: 51 lines → 13 lines (74% reduction per action)**

### Verification Process

**How we verified backend behavior:**
1. Read `UserController.cs` - no status codes in controller
2. Read `ErrorHandlingMiddleware.cs` - catches BaseException, sets StatusCode
3. Read exception classes - default status codes (400, 404)
4. Grep `UserService.cs` for `throw new` - found all exception types
5. Read `CaptchaMiddleware.cs` - always returns 400

**Result:** Frontend status code assumptions were incorrect.

### Files Affected
- Backend analysis:
  - `C:\Projects\Pastirma\PastirmaApi\API\Controllers\UserController.cs`
  - `C:\Projects\Pastirma\PastirmaApi\API\Middlewares\ErrorHandlingMiddleware.cs`
  - `C:\Projects\Pastirma\PastirmaApi\API\Middlewares\CaptchaMiddleware.cs`
  - `C:\Projects\Pastirma\PastirmaApi\Core\Exceptions\*.cs`
  - `C:\Projects\Pastirma\PastirmaApi\Application\Services\UserService.cs`

- Frontend refactoring:
  - `app/lib/actions/auth.ts` - 6 actions refactored (was 2)

### Related Documentation
- ADR-008: Partial Refactor of auth.ts (analysis corrected by this ADR)
- ADR-009: Logout Pattern (Server Action + Client Hook)
- TROUBLESHOOTING.md: Backend error handling section (should be added)

### Lessons Learned

**Always verify assumptions against actual implementation:**
- ✅ Read backend code, don't guess from frontend
- ✅ Check middleware and exception handling
- ✅ Grep for actual usage patterns
- ✅ Test in development vs production mode

**Frontend-backend alignment:**
- ✅ Backend controls error messages (single source of truth)
- ✅ Frontend displays messages, doesn't interpret status codes
- ✅ Status codes are for HTTP semantics, not business logic

**When to keep manual fetch:**
- ✅ Cookie management (can't be abstracted easily)
- ✅ Special status code handling (504 in login for showResend flag)
- ✅ Multiple Set-Cookie header parsing

---

## ADR-011: Backend Error Handling Simplification

**Date:** 2026-01-10
**Status:** ✅ Accepted

### Context

Backend error handling had accumulated unnecessary complexity as the project grew:

**Problems:**
- 5 different exception types (AuthException, BusinessException, NotFoundException, EmailException, BaseException)
- 6 different status codes across auth endpoints (400, 404, 502, 503, 504, 500)
- 2 inconsistent error handling patterns:
  - Some controllers had try-catch blocks
  - Other controllers relied on ErrorHandlingMiddleware
- ~260+ lines of redundant error handling code
- EmailService had 4 catch blocks with different status codes (502, 504, 400, 500)
- Frontend only displays `error.message`, never checks status codes (except 504 for unverified email)

**Initial Design vs Reality:**
- Started with detailed status code handling
- Midway through project, abandoned the idea
- Left with inconsistent error handling scattered throughout codebase

### Decision

**Simplify to single exception type and middleware-based error handling:**

1. **Exception Consolidation:**
   - Delete: AuthException, NotFoundException, EmailException
   - Keep: BaseException (base class) + BusinessException (only exception to use)
   - Default status code: 400 (Bad Request)
   - Special case: 504 for unverified email in login (frontend checks this)

2. **Controller Simplification:**
   - Remove ALL try-catch blocks from controllers
   - Let ErrorHandlingMiddleware catch all exceptions
   - Controllers only throw BusinessException

3. **Service Simplification:**
   - Replace all custom exceptions with BusinessException
   - Simplify EmailService from 4 catch blocks to 1
   - Keep descriptive error messages (frontend displays these)

### Rationale

**Why single exception type:**
- Frontend doesn't check status codes (displays message only)
- Backend error messages are descriptive ("Bu email zaten kayıtlı", "Kullanıcı bulunamadı")
- Status codes are HTTP semantics, not business logic
- Middleware sets the status code automatically
- Only ONE use case needs non-400 status: unverified email (504)

**Why middleware-based error handling:**
- Centralized error handling in one place (ErrorHandlingMiddleware)
- Controllers stay clean and focused on business logic
- Consistent error response format across all endpoints
- Easier to add logging, monitoring, or change error format

**Why descriptive messages:**
- Single source of truth (backend controls messaging)
- Frontend just displays what backend sends
- Easier to translate/localize later
- Users get meaningful error messages

### Consequences

**Benefits:**
- ✅ **~260+ lines of code eliminated**
  - EmailService: 76 → 49 lines (36% reduction)
  - BlogPostController: 213 → 119 lines (44% reduction)
  - CloudinaryController: 150 → 118 lines (21% reduction)
- ✅ **Consistent error handling** across entire backend
- ✅ **Cleaner controllers** - no try-catch noise
- ✅ **Simpler maintenance** - one exception type, one pattern
- ✅ **Frontend-backend alignment** - backend controls error messages

**Trade-offs:**
- ⚠️ Can't distinguish error types by status code (not needed - messages are descriptive)
- ⚠️ Special case for 504 must be documented (only place using non-400)

**Rules going forward:**
- ✅ **Always use BusinessException** - never create new exception types
- ✅ **Never add try-catch to controllers** - let middleware handle it
- ✅ **Write descriptive error messages** - frontend displays them directly
- ✅ **Default to 400 status** - only use custom status if frontend specifically checks it

### Implementation

**Exception Consolidation:**

```csharp
// Before: Multiple exception types
throw new AuthException("Bu email zaten kayıtlı");
throw new NotFoundException("Kullanıcı bulunamadı");
throw new InvalidOperationException("Bu kategoriye ait ürünler var");

// After: Single exception type
throw new BusinessException("Bu email zaten kayıtlı");
throw new BusinessException("Kullanıcı bulunamadı");
throw new BusinessException("Bu kategoriye ait ürünler var");

// Special case: Unverified email (only non-400 status code)
throw new BusinessException(
    "Email hesabı aktif edilmemiş.",
    StatusCodes.Status504GatewayTimeout  // Frontend checks this for "resend" button
);
```

**EmailService Simplification:**

```csharp
// Before: 76 lines, 4 catch blocks
try {
    var result = await _resend.EmailSendAsync(message);
}
catch (ResendException ex) {
    throw new EmailException("Email servisine ulaşılamıyor...", 502);
}
catch (TimeoutException ex) {
    throw new EmailException("Email servisi yanıt vermedi...", 504);
}
catch (FormatException ex) {
    throw new EmailException("Geçersiz email adresi.", 400);
}
catch (Exception ex) {
    throw new EmailException("Email gönderilemedi...", 500);
}

// After: 49 lines, 1 catch block
try {
    var result = await _resend.EmailSendAsync(message);
}
catch (Exception ex) {
    _logger.LogError(ex, "Email gönderilemedi: {ErrorType}", ex.GetType().Name);
    throw new BusinessException("Email gönderilemedi. Lütfen tekrar deneyin.");
}
```

**Controller Simplification:**

```csharp
// Before: BlogPostController with try-catch (213 lines)
[HttpPut("{id}")]
public async Task<ActionResult<BlogPostDTO>> UpdatePost(int id, [FromBody] UpdateBlogPostDTO dto)
{
    try {
        var post = await _blogPostService.UpdatePostAsync(id, dto);
        return Ok(post);
    }
    catch (NotFoundException ex) {
        return NotFound(new { message = ex.Message });
    }
    catch (Exception ex) {
        _logger.LogError(ex, "Error updating blog post: {PostId}", id);
        return StatusCode(500, new { message = "Blog yazısı güncellenirken bir hata oluştu." });
    }
}

// After: Let middleware handle exceptions (119 lines)
[HttpPut("{id}")]
public async Task<ActionResult<BlogPostDTO>> UpdatePost(int id, [FromBody] UpdateBlogPostDTO dto)
{
    var post = await _blogPostService.UpdatePostAsync(id, dto);
    return Ok(post);
}
```

**Middleware (unchanged - already correct):**

```csharp
// API/Middlewares/ErrorHandlingMiddleware.cs
catch (BaseException ex) {
    context.Response.StatusCode = ex.StatusCode;  // BusinessException sets this
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsJsonAsync(new { errors = new[] { ex.Message } });
}
catch (Exception ex) {
    _logger.LogError(ex, "Beklenmeyen bir hata oluştu");
    context.Response.StatusCode = 500;
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsJsonAsync(new { errors = new[] { "Beklenmeyen bir hata oluştu" } });
}
```

### Files Modified

**Exception Replacements (Services):**
- `Application/Services/UserService.cs` - 8 AuthException → BusinessException
- `Application/Services/CategoryService.cs` - NotFoundException, InvalidOperationException → BusinessException
- `Application/Services/BlogPostService.cs` - NotFoundException → BusinessException
- `Application/Services/BlogCategoryService.cs` - NotFoundException → BusinessException
- `Application/Services/ReviewService.cs` - NotFoundException, InvalidOperationException, UnauthorizedAccessException → BusinessException
- `Application/Services/AddressService.cs` - NotFoundException → BusinessException

**Exception Replacements (Controllers):**
- `API/Controllers/UserController.cs` - 2 AuthException → BusinessException

**Service Simplification:**
- `Infrastructure/Email/EmailService.cs` - 4 catch blocks → 1 catch block (76 → 49 lines)

**Controller Simplification:**
- `API/Controllers/BlogPostController.cs` - Removed all try-catch blocks (213 → 119 lines)
- `API/Controllers/CloudinaryController.cs` - Removed all try-catch blocks (150 → 118 lines)

**Exception Classes Deleted:**
- `Core/Exceptions/AuthException.cs` ❌ Deleted
- `Core/Exceptions/NotFoundException.cs` ❌ Deleted
- `Core/Exceptions/EmailException.cs` ❌ Deleted

**Exception Classes Kept:**
- `Core/Exceptions/BaseException.cs` ✅ Kept (base class)
- `Core/Exceptions/BusinessException.cs` ✅ Kept (only exception to use)

### Related Documentation
- ADR-010: Backend Error Architecture Discovery (frontend already simplified)
- CLAUDE.md: Error handling conventions

### Error Logging Recommendation

**NOT implemented** (user chose to defer):

For production error monitoring, consider:
- **Serilog** for file-based logging (development)
- **Sentry** free tier for production monitoring (alerts, stack traces, error grouping)

**Why NOT database logging:**
- Slow (50-200ms per error)
- Database bloat
- Circular dependency risk (DB errors can't log to DB)
- Limited analysis capabilities

---

## Template for New ADRs

When making a new architectural decision, add it here:

```markdown
## ADR-XXX: Title

**Date:** YYYY-MM-DD
**Status:** Accepted | Deprecated | Superseded

### Context
Why did we need to make this decision?

### Decision
What did we decide?

### Rationale
Why did we choose this approach?

### Consequences
- ✅ Benefits
- ⚠️ Trade-offs
- ❌ Limitations

### Implementation
Code examples if relevant

### Files Affected
List of modified files

### Related Documentation
Links to other docs
```

---

## Status Legend

- ✅ **Accepted:** Current active decision
- ⚠️ **Deprecated:** Still in code but being phased out
- ❌ **Superseded:** Replaced by newer decision (reference new ADR)

---

## How to Update This File

**When to add an ADR:**
1. Making a significant architectural choice
2. Choosing between multiple valid approaches
3. Decision affects multiple files/components
4. Future developers need to understand "why"
5. Trade-offs were considered

**When NOT to add an ADR:**
1. Simple bug fixes
2. Styling changes
3. Obvious implementations
4. Temporary workarounds

**Keep it updated:**
- Add new decisions as they happen
- Mark old decisions as deprecated when changed
- Reference ADRs in code comments for context
