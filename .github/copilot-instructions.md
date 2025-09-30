# GitHub Copilot Instructions

## Project Context
- Frontend framework: **Next.js (React 18+)**
- Styling: **Tailwind CSS**
- State management: **Redux Toolkit (Cart & User states)**
- Authentication: **JWT-based authentication**
- Comments: **Write all comments in English**
- Architecture: **Clean code principles & modular structure**

## Coding Guidelines
1. **Clean Code**
   - Use meaningful variable and function names.
   - Keep functions small and single-purpose.
   - Apply SOLID principles where possible.
   - Avoid code duplication.

2. **Frontend (Next.js + Tailwind CSS)**
   - Use functional React components with hooks.
   - Prefer server-side rendering (SSR) or static generation (SSG) when beneficial.
   - Tailwind: keep class usage concise and consistent.
   - Follow component-driven development (create reusable UI components).
   - Use TypeScript for type safety.
   - Use **Redux Toolkit** for global state:
     - **User Slice**:
       - Manage authentication state.
       - Store JWT token securely (in memory or httpOnly cookie preferred, fallback localStorage if required).
       - Handle login, logout, token refresh, and user profile data.
     - **Cart Slice**:
       - Manage cart items, quantities, and total amount.
       - Sync with backend when user is authenticated.
   - Persist cart data in localStorage for guest users.

3. **API Integration**
   - Consume backend APIs via fetch/axios with proper error handling.
   - Send JWT token in Authorization header (`Bearer <token>`).
   - Redux async thunks should handle API requests (login, logout, refresh token, cart actions).
   - Handle expired tokens gracefully (auto-logout or silent refresh).

4. **Code Style**
   - Use ESLint + Prettier for code formatting.
   - Ensure consistent formatting across files.

5. **Testing**
   - Write unit tests where applicable (Jest or React Testing Library).
   - Test Redux slices and async thunks (especially JWT handling).
   - Prefer testable, loosely coupled code.

## Additional Instructions
- Always write comments in English.
- Suggest best practices when generating code.
- Ensure accessibility (a11y) in frontend components.
- Keep performance in mind (e.g., avoid unnecessary re-renders, optimize API calls).
