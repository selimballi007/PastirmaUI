# Troubleshooting Guide

Common issues and their solutions for the Pastirma e-commerce platform.

## Table of Contents
- [Mobile Access Issues](#mobile-access-issues)
- [API Endpoint Errors](#api-endpoint-errors)
- [Configuration Issues](#configuration-issues)
- [CORS Errors](#cors-errors)
- [Build & Deployment Issues](#build--deployment-issues)

---

## Mobile Access Issues

### ❌ "Failed to fetch" on Mobile Phone

**Symptoms:**
- API requests work on desktop but fail on mobile
- Console shows: `Failed to fetch` errors
- Dashboard pages show no data on mobile

**Root Cause:**
Mobile phone can't access `localhost` - it refers to the phone itself, not your development PC.

**Solution:**

1. **Update Backend to listen on all interfaces:**
   ```json
   // C:\Projects\Pastirma\PastirmaApi\Properties\launchSettings.json
   "applicationUrl": "http://0.0.0.0:5296;http://localhost:5296"
   ```

2. **Add mobile CORS origin to backend:**
   ```bash
   dotnet user-secrets set "CorsSettings:AllowedOrigins:1" "http://192.168.1.104:3000"
   ```

3. **Update frontend API URL:**
   ```env
   # c:\Projects\Pastirma\pastirma-ui\.env.local
   NEXT_PUBLIC_API_URL=http://192.168.1.104:5296/api/
   ```

4. **Allow Next.js cross-origin access:**
   ```typescript
   // c:\Projects\Pastirma\pastirma-ui\next.config.ts
   allowedDevOrigins: ['192.168.1.104']
   ```

5. **Restart both servers**

**Access from mobile:** `http://192.168.1.104:3000`

**See also:** CLAUDE.md section on mobile network access

---

### ⚠️ "Blocked cross-origin request" in Next.js

**Symptoms:**
```
⚠ Blocked cross-origin request from 192.168.1.104 to /_next/* resource
```

**Cause:**
Next.js 15 blocks cross-origin requests to dev server by default.

**Solution:**
Format must be **hostname only** (no protocol/port):

```typescript
// ✅ Correct
allowedDevOrigins: ['192.168.1.104']

// ❌ Wrong
allowedDevOrigins: ['http://192.168.1.104:3000']
```

---

## API Endpoint Errors

### ❌ Review/Testimonials Endpoint 404

**Symptoms:**
```
[fetchUtils] Response not ok: 404
[Server] Error fetching testimonials: Error: Unknown error
```

**Cause:**
Endpoint naming mismatch - frontend uses singular, backend uses plural.

**Example:**
- Frontend: `api/review` ❌
- Backend: `api/reviews` ✅

**Solution:**
Check backend controller route and match it exactly:
```bash
# Check backend route
Get-Content C:\Projects\Pastirma\PastirmaApi\API\Controllers\ReviewController.cs | Select-String "Route"

# Update frontend to match
# Change: serverFetchAPI<any[]>('review')
# To:     serverFetchAPI<any[]>('reviews')
```

**Rule:** Always verify endpoint names match between frontend and backend.

---

### ❌ Blog Post Detail Returns 404

**Symptoms:**
Blog detail pages fail to load with 404 error.

**Cause:**
Endpoint name mismatch: `blogpost/` vs `blog-post/`

**Solution:**
Backend uses hyphenated format:
```typescript
// ❌ Wrong
const endpoint = `blogpost/${id}`;

// ✅ Correct
const endpoint = `blog-post/${id}`;
```

---

## Configuration Issues

### ❌ JWT Token Expires But Cookie Stays Valid

**Symptoms:**
User gets logged out even though token should still be valid (or vice versa).

**Cause:**
Hardcoded cookie expiration doesn't match JWT expiration from configuration.

**Bad Code:**
```csharp
Expires = DateTimeOffset.UtcNow.AddMinutes(15), // Hardcoded!
```

**Solution:**
Read from configuration (single source of truth):
```csharp
var accessTokenExpiresMinutes = _configuration.GetValue<int>("Jwt:AccessTokenExpiresMinutes");
Expires = DateTimeOffset.UtcNow.AddMinutes(accessTokenExpiresMinutes),
```

**File:** `C:\Projects\Pastirma\PastirmaApi\API\Controllers\UserController.cs`

---

### ❌ "Configuration is not configured" Error

**Symptoms:**
```
InvalidOperationException: CorsSettings:AllowedOrigins is not configured
```

**Cause:**
Required configuration missing from user secrets.

**Solution:**
```bash
# Check what's missing
dotnet user-secrets list

# Compare with template
# See: C:\Projects\Pastirma\PastirmaApi\appsettings.Template.json

# Add missing secrets
dotnet user-secrets set "CorsSettings:AllowedOrigins:0" "http://localhost:3000"
```

**Full setup guide:** `C:\Projects\Pastirma\PastirmaApi\SECRETS-SETUP.md`

---

## CORS Errors

### ❌ CORS Policy Error from Frontend

**Symptoms:**
```
Access to fetch at 'http://192.168.1.104:5296/api/...' from origin 'http://192.168.1.104:3000'
has been blocked by CORS policy
```

**Cause:**
Frontend origin not in backend's `allowedOrigins` list.

**Solution:**
```bash
# Add the frontend origin (including port!)
dotnet user-secrets set "CorsSettings:AllowedOrigins:1" "http://192.168.1.104:3000"

# Restart backend
dotnet run
```

**Note:** Must include protocol (`http://`) and port (`:3000`)

---

### ⚠️ Rollbar CORS Error in Firefox (Cloudinary)

**Symptoms:**
```
Çapraz köken isteği engellendi: https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/...
```

**Cause:**
Cloudinary upload widget uses Rollbar for internal error tracking. Firefox's strict tracking protection blocks it.

**Solution:**
**This is harmless and expected.** It's from Cloudinary's third-party code, not your application. You can safely ignore it or filter it out in your error tracking.

---

## Build & Deployment Issues

### ❌ Backend Build Fails with Warnings

**Cause:**
Backend has `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` in project file.

**Solution:**
Fix all warnings - they will prevent build from succeeding.

Common warnings:
- Unused variables
- Missing null checks
- Unreachable code

---

### ❌ Environment Variables Not Loading

**Symptoms:**
Settings that work locally don't work after deployment.

**Common Causes:**

1. **Using user secrets in production** (they don't deploy)
   - Solution: Set environment variables in hosting platform

2. **Wrong environment variable format:**
   ```bash
   # ❌ Wrong (user secrets format)
   Jwt:AccessTokenExpiresMinutes=15

   # ✅ Correct (environment variable format)
   Jwt__AccessTokenExpiresMinutes=15
   ```
   Note: Double underscores `__` for nested config

3. **Missing NEXT_PUBLIC_ prefix:**
   ```bash
   # ❌ Won't work in browser
   API_URL=http://...

   # ✅ Accessible in browser
   NEXT_PUBLIC_API_URL=http://...
   ```

---

## Performance Issues

### ⚠️ Cloudflare Turnstile Preload Warning

**Symptoms:**
```
The resource https://challenges.cloudflare.com/... was preloaded using link preload
but not used within a few seconds
```

**Cause:**
Turnstile CAPTCHA loads immediately but only needed on form submission.

**Solution:**
Lazy load Turnstile when user starts filling form:

```typescript
const [showTurnstile, setShowTurnstile] = useState(false);

const handleChange = (e) => {
    if (!showTurnstile) setShowTurnstile(true);
    // ... rest of handler
};

// In JSX
{showTurnstile && <Turnstile ref={turnstileRef} />}
```

**File:** `c:\Projects\Pastirma\pastirma-ui\app\(main)\contact\page.tsx`

---

## Database Issues

### ❌ Migration Fails

**Common causes:**
1. Database connection string wrong
2. Database server not running
3. Conflicting migration

**Solutions:**
```bash
# Check connection
dotnet user-secrets list | findstr "ConnectionStrings"

# Remove last migration (if needed)
dotnet ef migrations remove

# Reapply migrations
dotnet ef database update
```

---

## Quick Diagnostic Commands

**Check backend is running:**
```bash
curl http://localhost:5296/api/product
```

**Check frontend can reach backend:**
```bash
# From browser console (F12)
fetch('http://192.168.1.104:5296/api/product').then(r => r.json()).then(console.log)
```

**Check ports in use:**
```bash
# Windows
netstat -ano | findstr "5296"
netstat -ano | findstr "3000"
```

**View all configuration:**
```bash
# Backend
dotnet user-secrets list

# Frontend
cat .env.local
```

---

## When to Ask for Help

If you've tried the solutions above and still stuck:

1. ✅ Include full error message
2. ✅ Specify which file/line number
3. ✅ Mention what you've tried
4. ✅ Note if it works on desktop/mobile

See CLAUDE.md "Before Asking Claude" section for more tips.

---

## Related Documentation

- **Configuration Setup:** `C:\Projects\Pastirma\PastirmaApi\SECRETS-SETUP.md`
- **Project Guide:** `c:\Projects\Pastirma\pastirma-ui\CLAUDE.md`
- **Architecture Decisions:** `docs/ADR.md` (if exists)
