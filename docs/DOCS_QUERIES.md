# Database Queries Documentation

This document provides comprehensive documentation for all database queries in the Bandsy application. These queries are designed to be used in both API routes and server components for optimal performance and maintainability.

## Table of Contents

- [Overview](#overview)
- [User Queries](#user-queries)
- [Browse Queries](#browse-queries)
- [Reference Queries](#reference-queries)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

All queries are located in `src/server/queries.ts` and use Drizzle ORM with PostgreSQL. The queries are designed to be:

- **Type-safe** with full TypeScript support
- **Reusable** across API routes and server components
- **Optimized** with proper indexing and efficient joins
- **Scalable** with pagination and filtering support
- **Robust** with comprehensive error handling and null safety

## User Queries

### `getUserById(userId: string)`

Retrieves a single user by their internal database ID.

**Parameters:**

- `userId` (string) - The internal user ID

**Returns:**

- `User | null` - User object or null if not found

**Example:**

```typescript
import { getUserById } from "@/server/queries";

const user = await getUserById("user_123");
if (user) {
  console.log(user.displayName);
}
```

**Use Cases:**

- Profile pages
- User detail views
- Internal user lookups

---

### `getUserByClerkId(clerkId: string)`

Retrieves a single user by their Clerk authentication ID.

**Parameters:**

- `clerkId` (string) - The Clerk user ID

**Returns:**

- `User | null` - User object or null if not found

**Example:**

```typescript
import { getUserByClerkId } from "@/server/queries";

const user = await getUserByClerkId("user_2abc123def456");
if (user) {
  console.log(user.username);
}
```

**Use Cases:**

- Authentication flows
- User session management
- Clerk webhook processing

## Browse Queries

### `browseUsers(currentUserId: string, filters?: BrowseFilters)`

Main query for browsing and discovering other musicians. Supports advanced filtering, sorting, and pagination with robust JSON aggregation and error handling.

**Parameters:**

- `currentUserId` (string) - Clerk ID of the authenticated user (excluded from results)
- `filters` (BrowseFilters, optional) - Filtering and pagination options

**BrowseFilters Interface:**

```typescript
interface BrowseFilters {
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 20, max: 50)
  search?: string; // Search across name, username, bio, instruments, genres
  instrument?: string; // Filter by specific instrument
  genre?: string; // Filter by specific genre
  skillLevel?: "beginner" | "intermediate" | "advanced" | "professional";
  location?: string; // Filter by city/location
  sortBy?: "recent" | "name" | "location"; // Sort field
  sortOrder?: "asc" | "desc"; // Sort direction
}
```

**Returns:**

```typescript
interface BrowseUsersResult {
  data: Array<{
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    age: number | null;
    showAge: boolean | null;
    city: string | null;
    region: string | null;
    country: string | null;
    profileImageUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    instruments: Array<{
      id: string;
      name: string;
      category: string;
      skillLevel: string;
      yearsOfExperience: number;
      isPrimary: boolean;
    }>;
    genres: Array<{
      id: string;
      name: string;
      preference: number;
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

**Examples:**

**Basic browsing:**

```typescript
import { browseUsers } from "@/server/queries";

const result = await browseUsers(userId);
console.log(`Found ${result.data.length} musicians`);
```

**With filters:**

```typescript
const result = await browseUsers(userId, {
  page: 2,
  limit: 10,
  search: "guitar",
  instrument: "Electric Guitar",
  genre: "Rock",
  skillLevel: "intermediate",
  location: "Los Angeles",
  sortBy: "name",
  sortOrder: "asc",
});
```

**In server component:**

```typescript
// src/app/browse/page.tsx
export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const filters: BrowseFilters = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    search: searchParams.search ?? "",
    instrument: searchParams.instrument,
    genre: searchParams.genre,
    // ... other filters
  };

  const result = await browseUsers(userId, filters);

  return (
    <div>
      {result.data.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

**In API route:**

```typescript
// src/app/api/users/browse/route.ts
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters: BrowseFilters = {
    page: parseInt(searchParams.get("page") ?? "1"),
    search: searchParams.get("search") ?? "",
    // ... parse other filters
  };

  const result = await browseUsers(userId, filters);

  return NextResponse.json({
    data: result.data,
    pagination: result.pagination,
    filters,
  });
}
```

**Features:**

- ✅ **Search** across multiple fields (name, username, bio, instruments, genres)
- ✅ **Filtering** by instrument, genre, skill level, location
- ✅ **Sorting** by recent activity, name, or location
- ✅ **Pagination** with configurable page size
- ✅ **Robust JSON aggregation** with null safety and error handling
- ✅ **Performance optimized** with proper joins and indexing
- ✅ **Type safety** with full TypeScript support
- ✅ **Graceful error handling** for malformed data

## Reference Queries

### `getInstruments()`

Retrieves all available instruments for dropdowns and filtering.

**Returns:**

- `Instrument[]` - Array of all instruments ordered by name

**Example:**

```typescript
import { getInstruments } from "@/server/queries";

const instruments = await getInstruments();
// Use for filter dropdowns, instrument selection, etc.
```

---

### `getGenres()`

Retrieves all available genres for dropdowns and filtering.

**Returns:**

- `Genre[]` - Array of all genres ordered by name

**Example:**

```typescript
import { getGenres } from "@/server/queries";

const genres = await getGenres();
// Use for filter dropdowns, genre selection, etc.
```

## Best Practices

### 1. **Use in Server Components When Possible**

Server components provide better performance by eliminating client-server round trips:

```typescript
// ✅ Good - Server component
export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id);
  if (!user) return <NotFound />;

  return <ProfileCard user={user} />;
}

// ❌ Avoid - Client component with API call
'use client';
const [user, setUser] = useState(null);
useEffect(() => {
  fetch(`/api/users/${id}`).then(res => res.json()).then(setUser);
}, [id]);
```

### 2. **Parallel Data Fetching**

Use `Promise.all()` for multiple independent queries:

```typescript
// ✅ Good - Parallel execution
const [users, instruments, genres] = await Promise.all([
  browseUsers(userId, filters),
  getInstruments(),
  getGenres(),
]);

// ❌ Avoid - Sequential execution
const users = await browseUsers(userId, filters);
const instruments = await getInstruments();
const genres = await getGenres();
```

### 3. **Proper Error Handling**

Always handle potential errors gracefully:

```typescript
try {
  const result = await browseUsers(userId, filters);
  return result;
} catch (error) {
  console.error("Error fetching users:", error);
  // Return empty result or throw appropriate error
  return {
    data: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}
```

### 4. **Type Safety**

Always use TypeScript interfaces for better development experience:

```typescript
// ✅ Good - Type-safe
const filters: BrowseFilters = {
  page: parseInt(searchParams.page ?? "1"),
  search: searchParams.search ?? "",
};

// ❌ Avoid - No type safety
const filters = {
  page: parseInt(searchParams.page ?? "1"),
  search: searchParams.search ?? "",
};
```

## Error Handling

### Common Error Scenarios

1. **Database Connection Issues**

   ```typescript
   try {
     const result = await browseUsers(userId, filters);
   } catch (error) {
     if (error.code === "ECONNREFUSED") {
       // Handle database connection error
       throw new Error("Database temporarily unavailable");
     }
     throw error;
   }
   ```

2. **Invalid User ID**

   ```typescript
   const user = await getUserById(userId);
   if (!user) {
     // Handle user not found
     redirect("/404");
   }
   ```

3. **Invalid Filter Parameters**

   ```typescript
   const filters: BrowseFilters = {
     page: Math.max(1, parseInt(pageParam ?? "1")),
     limit: Math.min(50, Math.max(1, parseInt(limitParam ?? "20"))),
   };
   ```

4. **JSON Parsing Errors (Fixed)**
   ```typescript
   // The browseUsers query now handles JSON parsing errors automatically
   // No additional error handling needed for malformed JSON
   const result = await browseUsers(userId, filters);
   // result.data will always have valid instruments and genres arrays
   ```

## Performance Considerations

### 1. **Pagination Limits**

- Default limit: 20 items per page
- Maximum limit: 50 items per page
- Larger limits increase memory usage and response time

### 2. **Search Optimization**

- Search queries use `LIKE` with lowercase matching
- Consider adding full-text search indexes for better performance
- Search across multiple fields may be slower than single-field searches

### 3. **JSON Aggregation (Improved)**

- Instruments and genres are aggregated using PostgreSQL's `json_agg` with `COALESCE`
- **Null safety**: Uses `FILTER (WHERE column IS NOT NULL)` to exclude null values
- **Fallback values**: Returns empty JSON arrays `'[]'::json` when no data exists
- **Error handling**: Robust parsing with try-catch blocks and type validation
- This reduces the number of database round trips while ensuring data integrity

### 4. **Indexing Recommendations**

Ensure these indexes exist for optimal performance:

```sql
-- Users table
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_display_name ON users(display_name);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_updated_at ON users(updated_at);

-- User instruments
CREATE INDEX idx_user_instruments_user_id ON user_instruments(user_id);
CREATE INDEX idx_user_instruments_instrument_id ON user_instruments(instrument_id);
CREATE INDEX idx_user_instruments_skill_level ON user_instruments(skill_level);

-- User genres
CREATE INDEX idx_user_genres_user_id ON user_genres(user_id);
CREATE INDEX idx_user_genres_genre_id ON user_genres(genre_id);
```

### 5. **Caching Strategy**

Consider implementing caching for frequently accessed data:

```typescript
// Example with React Cache (Next.js 13+)
import { cache } from "react";

export const getCachedInstruments = cache(async () => {
  return getInstruments();
});

export const getCachedGenres = cache(async () => {
  return getGenres();
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. **JSON Parsing Errors (Fixed)**

**Problem:** `SyntaxError: Unexpected token 'o', "[object Obj"... is not valid JSON`

**Cause:** PostgreSQL `json_agg` returning malformed JSON when users have no instruments/genres

**Solution:** The query now uses:

- `COALESCE` to provide fallback empty arrays
- `FILTER (WHERE column IS NOT NULL)` to exclude null values
- Robust error handling in JSON parsing
- Type validation before returning arrays

**Example:**

```typescript
// Before (could cause errors):
instruments: user.instruments ? JSON.parse(user.instruments) : []

// After (robust handling):
instruments: (() => {
  try {
    if (!user.instruments || user.instruments === '[object Object]') return [];
    const parsed = JSON.parse(user.instruments) as unknown;
    return Array.isArray(parsed) ? parsed as Array<...> : [];
  } catch {
    return [];
  }
})(),
```

#### 2. **Empty Results for Users Without Data**

**Problem:** Users without instruments or genres return empty arrays

**Solution:** This is now handled gracefully - users will show with empty instrument/genre lists rather than causing errors.

#### 3. **Performance Issues with Large Datasets**

**Problem:** Slow queries with many users or complex filters

**Solutions:**

- Ensure proper database indexes are created
- Use pagination with reasonable limits (max 50)
- Consider implementing caching for reference data
- Monitor query performance with database logs

### Debugging Queries

To debug query issues:

1. **Check the database logs** for slow queries or errors
2. **Test with minimal filters** to isolate the problem
3. **Verify data exists** in the database for the user
4. **Check TypeScript types** match the actual database schema

## Migration and Updates

When adding new queries or modifying existing ones:

1. **Update this documentation**
2. **Add TypeScript interfaces** for new return types
3. **Include usage examples** in the documentation
4. **Test with various filter combinations**
5. **Verify performance** with realistic data volumes
6. **Add error handling** for edge cases
7. **Test with null/empty data** scenarios

## Contributing

When contributing new queries:

1. Follow the existing naming conventions
2. Include proper TypeScript types
3. Add comprehensive error handling
4. Document the query in this file
5. Include usage examples
6. Consider performance implications
7. Test with edge cases (null values, empty results, etc.)
