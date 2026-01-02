# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pastirma** is an e-commerce platform with a Next.js frontend and ASP.NET Core backend.

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Zustand
- **Backend**: ASP.NET Core .NET 10, PostgreSQL, Entity Framework Core 10
- **Image Storage**: Cloudinary (CloudinaryDotNet SDK + next-cloudinary)
- **Authentication**: Cookie-based JWT (access + refresh tokens in HTTP-only cookies)

The frontend and backend are in separate repositories:
- Frontend: `c:\Projects\Pastirma\pastirma-ui\`
- Backend: `C:\Projects\Pastirma\PastirmaApi\`

## Working with Claude Code

**Session Continuity**: Claude Code can remember context from previous sessions through automatic conversation summaries. When a conversation reaches the context limit, it will be summarized and can be continued in a new session, preserving:

- Previous implementation decisions and patterns
- Known issues and their solutions
- Type consolidation and architectural changes
- Ongoing refactoring work

This enables multi-session workflows without losing project context or having to re-explain previous work.

## Development Commands

### Frontend (Next.js)

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Frontend runs on `http://localhost:3000` and connects to API at `http://localhost:5296/api/`

### Backend (ASP.NET Core)

```bash
# Build the project
dotnet build

# Run the API
dotnet run

# Database migrations
dotnet ef migrations add <MigrationName>
dotnet ef database update

# Clean build artifacts
dotnet clean

# Restore NuGet packages
dotnet restore
```

Backend API runs on `http://localhost:5296`

## Architecture

### Backend (Clean Architecture)

```
PastirmaApi/
├── API/
│   ├── Controllers/          # API endpoints (kebab-case routes)
│   └── Extensions/           # Service registration extensions
├── Application/
│   ├── DTOs/                 # Data Transfer Objects (prevent circular refs)
│   │   ├── ProductDTOs/
│   │   ├── UserDTOs/
│   │   └── ...
│   ├── Interfaces/
│   │   ├── Repositories/     # Repository contracts
│   │   └── Services/         # Service contracts
│   └── Services/             # Business logic implementation
├── Core/
│   └── Entities/             # Domain models (EF entities)
├── Infrastructure/
│   ├── Data/
│   │   ├── ApplicationDbContext.cs
│   │   ├── Repositories/     # EF repository implementations
│   │   └── Migrations/       # EF migrations
│   ├── Email/                # Email services (Resend)
│   └── Identity/             # JWT authentication
└── Program.cs                # App configuration & DI
```

**Flow**: `Controller → Service → Repository → DbContext → PostgreSQL`

**Note**: The project uses mixed patterns:
- `UserService` uses repository pattern (IUserRepository)
- Other services (ReviewService, BlogPostService, etc.) access DbContext directly
Both patterns are acceptable in this codebase

### Frontend (Next.js App Router)

```
app/
├── (main)/                   # Public routes (with layout)
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── account/
├── dashboard/                # Admin routes (protected)
│   ├── products/
│   ├── reviews/
│   ├── customers/            # Customer management
│   ├── settings/             # User profile & password
│   ├── media/
│   └── ...
├── components/               # Shared React components
│   ├── home/
│   ├── product/
│   └── dashboard/
├── lib/
│   ├── api/                  # API client utilities
│   │   └── client.ts         # Cookie-based fetch with token refresh
│   ├── server/               # Server-side utilities (SSR/SSG)
│   ├── services/             # Client-side service layers
│   ├── store/                # Zustand state stores
│   │   ├── authStore.ts      # Authentication state
│   │   └── cartStore.ts      # Shopping cart state
│   ├── actions/              # Server Actions
│   └── utils/                # Shared utilities
└── types/                    # TypeScript type definitions

middleware.ts                 # Route protection & auth checks
```

### Type Organization

**All TypeScript types are centralized in `app/types/`** for consistency and reusability.

```
app/types/
├── common.ts       # Shared utilities (PagedResult<T>)
├── user.ts         # User, UserProfile, Customer
├── cart.ts         # CartItem
├── contact.ts      # ContactMessage
├── category.ts     # Category, CategoryWithProductCount, DTOs
├── favorite.ts     # FavoriteProduct
├── heroSlide.ts    # HeroSlide, DTOs
├── testimonial.ts  # Testimonial, TestimonialStat
├── order.ts        # Order, OrderStatus, OrderItem, PaymentMethod
└── dashboard.ts    # Dashboard-specific types, Review, Product
```

**Key Principles**:

1. **Domain Models in Types** ✅
   - Reusable data structures (User, Product, Order, etc.)
   - Shared across multiple files
   - Pure data - no functions or Zustand-specific logic

2. **Implementation Details Stay Local** ❌
   - Zustand store state interfaces (`AuthStore`, `CartStore`)
   - Page-specific UI types (`FormData`, `StatCard`)
   - Component-specific props interfaces

3. **Generic Types for Reusability**
   ```typescript
   // Use generic PagedResult<T> from common.ts
   import type { PagedResult } from '@/app/types/common';
   const result = await fetchAPI<PagedResult<Customer>>('users');
   ```

4. **Re-exports for Convenience**
   - Services re-export types they import
   - Stores re-export domain models
   - Maintains backward compatibility

**Examples**:

```typescript
// ✅ GOOD: Domain model in types/
export interface User {
    id: number;
    email: string;
    role: string;
}

// ❌ BAD: Store state stays in store file
interface AuthStore {
    user: User | null;
    login: (user: User) => void;  // Functions = implementation detail
}
```

## Key Conventions

### Database (PostgreSQL)
- **Naming**: snake_case for tables and columns (e.g., `product_images`, `created_at`)
- **Migrations**: Use EF Core migrations, never modify database directly
- **Connection string**: Configured in `appsettings.json`

### API Endpoints
- **Route naming**: kebab-case (e.g., `/api/product`, `/api/cloudinary/images`)
- **Authentication**: Protected routes use `[Authorize(Roles = "Admin")]` attribute
- **Response format**: Return DTOs, never entities (prevents circular references)

### DTOs vs Entities
**Critical**: Always use DTOs in API responses, never return Entity Framework entities directly.

- **Entities** (`Core/Entities`): Have navigation properties that cause circular references
- **DTOs** (`Application/DTOs`): Flat data structures safe for JSON serialization

Example: `ProductDTO` uses `ICollection<ProductImageDTO>`, not `ICollection<ProductImage>`

### Image Architecture (Dual-Image System)

Products use a **dual-image architecture** for performance:

1. **`imageUrl` (string)**: Single main image URL for fast card/list displays
2. **`images` (collection)**: Full gallery for detail pages

**Rules**:
- Main image must be set via star icon in dashboard (no auto-assignment)
- When adding images, user must explicitly click star to set main image
- Deleting main image does NOT auto-assign from product images
- Product update validation requires `imageUrl` to be present

**Implementation**:
- Backend: `Product.ImageUrl` + `Product.Images` navigation property
- Frontend: Form validation prevents updates without main image
- State management: Use functional setState to avoid race conditions

### Authentication Flow

1. User logs in → Backend returns access + refresh tokens as HTTP-only cookies
2. Frontend stores user info in Zustand (`authStore`)
3. Client requests include cookies automatically
4. Middleware checks `accessToken` cookie for protected routes
5. On 401, client calls refresh endpoint, updates cookies via Server Action
6. Logout clears cookies and Zustand state

**Key files**:
- Backend: `Infrastructure/Identity/JwtService.cs`
- Frontend: `lib/api/client.ts` (auto-refresh on 401)
- Middleware: `middleware.ts` (route protection)

### State Management (Zustand)

**Note**: Project uses **Zustand**, not Redux (copilot-instructions.md is outdated)

**Stores**:
- `authStore.ts`: User authentication state (login, logout, user data)
- `cartStore.ts`: Shopping cart state (items, quantities, totals)
- `categoryStore.ts`: Category data with 5-minute caching and localStorage persistence

**CategoryStore Pattern** (use this for categories, don't fetch directly):
```typescript
import { useCategoryStore } from '@/app/lib/store/categoryStore';

const { categories, fetchCategories, refreshCategories, loading } = useCategoryStore();

// Auto-cached for 5 minutes
fetchCategories(); // Won't refetch if cache is valid

// Force refresh
refreshCategories(); // Bypasses cache
```

**Benefits**: Centralized caching, reduced API calls, persistent storage, consistent state across pages

### Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5296/api/
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<cloudflare-turnstile-key>
```

**Backend** (User Secrets or `appsettings.Development.json`):
- `ConnectionStrings:DefaultConnection`: PostgreSQL connection
- `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`: JWT configuration
- `Cloudinary:CloudName`, `Cloudinary:ApiKey`, `Cloudinary:ApiSecret`
- `Resend:ApiKey`: Email service

## Common Patterns

### Frontend Data Fetching

**Server Components** (SSR/SSG):
```typescript
import { serverFetchAPI } from '@/app/lib/server/api';

const data = await serverFetchAPI<ProductDTO[]>('product');
```

**Client Components**:
```typescript
import { fetchAPI } from '@/app/lib/api/client';

const data = await fetchAPI<ProductDTO[]>('product');
```

### Backend Service Pattern

```csharp
// Controller
[HttpGet]
public async Task<ActionResult<List<ProductDTO>>> GetProducts()
{
    var products = await _productService.GetAllProductsAsync();
    return Ok(products);
}

// Service
public async Task<List<ProductDTO>> GetAllProductsAsync()
{
    var products = await _context.Products
        .Include(p => p.Images)
        .ToListAsync();

    return products.Select(MapToDto).ToList();
}

// Always map to DTO
private static ProductDTO MapToDto(Product product) { ... }
```

### State Updates (Avoid Race Conditions)

**Bad** (stale state):
```typescript
const newImages = [...formData.images, newImage];
setFormData({ ...formData, images: newImages });
```

**Good** (functional setState):
```typescript
setFormData(prev => {
    const newImages = [...prev.images, newImage];
    return { ...prev, images: newImages };
});
```

### Pagination Pattern (Backend)

Use `PagedResult<T>` for paginated endpoints:

```csharp
// DTO (Application/DTOs/ReviewDTOs/PagedResult.cs)
public class PagedResult<T>
{
    public List<T> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

// Repository pattern
var query = _context.Users.Where(u => u.Role == UserRole.Customer);
var totalCount = await query.CountAsync();
var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

var data = await query
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .Select(u => new CustomerDTO { ... })
    .ToListAsync();

return new PagedResult<CustomerDTO>
{
    Data = data,
    TotalCount = totalCount,
    Page = page,
    PageSize = pageSize,
    TotalPages = totalPages
};
```

### User Management Endpoints

**Profile Management**:
- `GET /api/user/profile` - Get current user profile (requires auth)
- `PUT /api/user/profile` - Update profile (username, fullName)
- `POST /api/user/change-password` - Change password with current password verification

**Customer Management** (Admin only):
- `GET /api/user/customers?page=1&pageSize=10` - List customers with pagination

**Pattern**: User ID extracted from JWT claims, ensuring users only access their own data

## Important Notes

### Cloudinary Integration
- **Upload**: Use `CldUploadWidget` component (next-cloudinary)
- **Delete**: Extract publicId from URL using regex in `extractPublicId()`
- **URL encoding**: Backend must decode route parameters (`Uri.UnescapeDataString`)

### Product Image Management
- Images are renumbered sequentially after add/delete (displayOrder: 1, 2, 3, ...)
- Use functional setState when handling rapid uploads to prevent overwrites
- Delete handlers should gracefully handle "not found" errors

### Route Protection
- Public routes: `app/(main)/`
- Admin routes: `app/dashboard/` (protected by middleware)
- Middleware checks for `accessToken` cookie, redirects to login if missing

### Warnings as Errors
Backend project has `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` - all warnings must be fixed before building.

## Dashboard Pages

### Implemented Pages

**Customers Page** (`/dashboard/customers`):
- Lists all customers with pagination
- Shows customer info: email, username, full name, verification status
- Displays statistics: total orders, total reviews
- Search functionality by email, username, or full name
- Admin only (requires Admin role)

**Settings Page** (`/dashboard/settings`):
- **Account Information**: Display email, role, registration date, last login
- **Profile Update**: Edit username and full name
- **Password Change**: Change password with current password verification
- Success/error messages with auto-dismiss
- Requires authentication (any logged-in user)

**Categories Page** (`/dashboard/categories`):
- Create, edit, delete categories
- Toggle category status (active/inactive)
- Icon picker with emoji support
- Uses categoryStore for state management

**Products Page** (`/dashboard/products`):
- List, create, edit, delete products
- Multiple image upload with main image selection
- Category dropdown uses categoryStore

**Reviews Page** (`/dashboard/reviews`):
- List reviews with pagination
- Filter by status (Pending, Approved, Rejected)
- Approve/reject reviews
- View review statistics
