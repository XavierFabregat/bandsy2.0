# Database Mutations Documentation

This document provides comprehensive documentation for all database mutations in the Bandsy application. These mutations are designed to be used in server actions and API routes for safe, type-safe database updates.

## Table of Contents

- [Overview](#overview)
- [User Mutations](#user-mutations)
- [Instrument Mutations](#instrument-mutations)
- [Genre Mutations](#genre-mutations)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Transaction Management](#transaction-management)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

All mutations are located in `src/server/mutations.ts` and use Drizzle ORM with PostgreSQL. The mutations are designed to be:

- **Type-safe** with full TypeScript support
- **Atomic** with proper transaction handling
- **Reusable** across server actions and API routes
- **Optimized** with efficient database operations
- **Safe** with proper validation and error handling
- **Consistent** with standardized update patterns

## User Mutations

### `updateUserProfile(userId: string, data: UserProfileData)`

Updates a user's basic profile information including personal details and location.

**Parameters:**

- `userId` (string) - The internal user ID to update
- `data` (UserProfileData) - The profile data to update

**UserProfileData Interface:**

```typescript
interface UserProfileData {
  displayName: string;
  bio: string;
  age: number | null;
  showAge: boolean;
  city: string;
  region: string;
  country: string;
  updatedAt?: Date; // Optional, defaults to current timestamp
}
```

**Returns:**

- `Promise<void>` - No return value, throws on error

**Example:**

```typescript
import { updateUserProfile } from "@/server/mutations";

await updateUserProfile("user_123", {
  displayName: "John Doe",
  bio: "Passionate guitarist with 8 years of experience...",
  age: 25,
  showAge: true,
  city: "Los Angeles",
  region: "California",
  country: "United States",
});
```

**Use Cases:**

- Profile editing
- User onboarding
- Profile completion flows

**Database Operations:**

- Updates the `users` table
- Automatically sets `updatedAt` timestamp
- Validates required fields

---

## Instrument Mutations

### `updateUserInstruments(userId: string, data: UserInstrumentData[])`

Completely replaces a user's instrument associations with new data. This operation is atomic - it clears all existing instruments and inserts the new ones.

**Parameters:**

- `userId` (string) - The internal user ID to update
- `data` (UserInstrumentData[]) - Array of instrument data to insert

**UserInstrumentData Interface:**

```typescript
interface UserInstrumentData {
  userId: string;
  instrumentId: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  yearsOfExperience: number | null;
  isPrimary: boolean;
}
```

**Returns:**

- `Promise<void>` - No return value, throws on error

**Example:**

```typescript
import { updateUserInstruments } from "@/server/mutations";

await updateUserInstruments("user_123", [
  {
    userId: "user_123",
    instrumentId: "guitar_001",
    skillLevel: "intermediate",
    yearsOfExperience: 5,
    isPrimary: true,
  },
  {
    userId: "user_123",
    instrumentId: "bass_001",
    skillLevel: "beginner",
    yearsOfExperience: 2,
    isPrimary: false,
  },
]);
```

**Use Cases:**

- Profile instrument management
- Skill level updates
- Primary instrument changes

**Database Operations:**

- Deletes all existing `userInstruments` for the user
- Inserts new `userInstruments` records
- Maintains referential integrity

**Important Notes:**

- This is a **replace** operation, not an update
- All existing instruments are removed before new ones are added
- Ensure at least one instrument is marked as primary
- The `userId` in each data object should match the parameter

---

## Genre Mutations

### `updateUserGenres(userId: string, data: UserGenreData[])`

Completely replaces a user's genre associations with new data. This operation is atomic - it clears all existing genres and inserts the new ones.

**Parameters:**

- `userId` (string) - The internal user ID to update
- `data` (UserGenreData[]) - Array of genre data to insert

**UserGenreData Interface:**

```typescript
interface UserGenreData {
  userId: string;
  genreId: string;
  preference: number; // 1-5 scale, where 5 is primary
}
```

**Returns:**

- `Promise<void>` - No return value, throws on error

**Example:**

```typescript
import { updateUserGenres } from "@/server/mutations";

await updateUserGenres("user_123", [
  {
    userId: "user_123",
    genreId: "rock_001",
    preference: 5, // Primary genre
  },
  {
    userId: "user_123",
    genreId: "blues_001",
    preference: 4,
  },
  {
    userId: "user_123",
    genreId: "jazz_001",
    preference: 3,
  },
]);
```

**Use Cases:**

- Profile genre management
- Genre preference updates
- Primary genre changes

**Database Operations:**

- Deletes all existing `userGenres` for the user
- Inserts new `userGenres` records
- Maintains referential integrity

**Preference Scale:**

- `5` - Primary genre (highest preference)
- `4` - High preference
- `3` - Medium preference
- `2` - Low preference
- `1` - Minimal preference

**Important Notes:**

- This is a **replace** operation, not an update
- All existing genres are removed before new ones are added
- Ensure at least one genre has preference level 5 (primary)
- The `userId` in each data object should match the parameter

---

## Best Practices

### 1. **Always Use Transactions for Related Updates**

When updating multiple related tables, wrap operations in a transaction:

```typescript
import { db } from "@/server/db";

await db.transaction(async (tx) => {
  await updateUserProfile(userId, profileData);
  await updateUserInstruments(userId, instrumentData);
  await updateUserGenres(userId, genreData);
});
```

### 2. **Validate Data Before Mutations**

Always validate input data before calling mutations:

```typescript
// Validate required fields
if (!profileData.displayName?.trim()) {
  throw new Error("Display name is required");
}

// Validate data types
if (profileData.age && (profileData.age < 13 || profileData.age > 120)) {
  throw new Error("Age must be between 13 and 120");
}

// Validate arrays
if (instrumentData.length === 0) {
  throw new Error("At least one instrument is required");
}
```

### 3. **Handle Errors Gracefully**

Wrap mutations in try-catch blocks and provide meaningful error messages:

```typescript
try {
  await updateUserProfile(userId, profileData);
} catch (error) {
  console.error("Failed to update user profile:", error);
  throw new Error("Failed to update profile. Please try again.");
}
```

### 4. **Use Type-Safe Parameters**

Always use the correct types for mutation parameters:

```typescript
// ✅ Good - Type-safe
const profileData: UserProfileData = {
  displayName: "John Doe",
  bio: "Musician...",
  age: 25,
  showAge: true,
  city: "Los Angeles",
  region: "California",
  country: "United States",
};

// ❌ Avoid - No type safety
const profileData = {
  displayName: "John Doe",
  // Missing required fields
};
```

## Error Handling

### Common Error Scenarios

1. **Foreign Key Constraint Violations**

   ```typescript
   try {
     await updateUserInstruments(userId, instrumentData);
   } catch (error) {
     if (error.code === "23503") {
       // Handle foreign key constraint violation
       throw new Error("Invalid instrument ID provided");
     }
     throw error;
   }
   ```

2. **Unique Constraint Violations**

   ```typescript
   try {
     await updateUserProfile(userId, profileData);
   } catch (error) {
     if (error.code === "23505") {
       // Handle unique constraint violation
       throw new Error("Display name already taken");
     }
     throw error;
   }
   ```

3. **Data Validation Errors**

   ```typescript
   // Validate before mutation
   if (!profileData.displayName?.trim()) {
     throw new Error("Display name cannot be empty");
   }
   ```

## Transaction Management

### Single Table Updates

For single table updates, mutations handle transactions internally:

```typescript
// Simple update - no transaction needed
await updateUserProfile(userId, profileData);
```

### Multi-Table Updates

For updates involving multiple tables, use explicit transactions:

```typescript
import { db } from "@/server/db";

await db.transaction(async (tx) => {
  // Update profile
  await tx.update(users).set(profileData).where(eq(users.id, userId));

  // Update instruments
  await tx.delete(userInstruments).where(eq(userInstruments.userId, userId));
  if (instrumentData.length > 0) {
    await tx.insert(userInstruments).values(instrumentData);
  }

  // Update genres
  await tx.delete(userGenres).where(eq(userGenres.userId, userId));
  if (genreData.length > 0) {
    await tx.insert(userGenres).values(genreData);
  }
});
```

## Performance Considerations

### 1. **Batch Operations**

For multiple updates, use batch operations when possible:

```typescript
// ✅ Good - Single batch insert
await db.insert(userInstruments).values(instrumentData);

// ❌ Avoid - Multiple individual inserts
for (const instrument of instrumentData) {
  await db.insert(userInstruments).values(instrument);
}
```

### 2. **Minimize Database Round Trips**

Combine related operations into single mutations:

```typescript
// ✅ Good - Single mutation call
await updateUserProfile(userId, {
  displayName: "John",
  bio: "Musician",
  // ... all profile fields
});

// ❌ Avoid - Multiple separate updates
await updateDisplayName(userId, "John");
await updateBio(userId, "Musician");
// ... more separate calls
```

### 3. **Use Appropriate Indexes**

Ensure your database has proper indexes for mutation operations:

```sql
-- Indexes for user updates
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_updated_at ON users(updated_at);

-- Indexes for user instruments
CREATE INDEX idx_user_instruments_user_id ON user_instruments(user_id);
CREATE INDEX idx_user_instruments_instrument_id ON user_instruments(instrument_id);

-- Indexes for user genres
CREATE INDEX idx_user_genres_user_id ON user_genres(user_id);
CREATE INDEX idx_user_genres_genre_id ON user_genres(genre_id);
```

## Troubleshooting

### Common Issues

1. **"Cannot read property 'id' of undefined"**

   **Cause:** User not found in database
   **Solution:** Verify user exists before mutation

   ```typescript
   const user = await getUserById(userId);
   if (!user) {
     throw new Error("User not found");
   }
   ```

2. **"Foreign key constraint violation"**

   **Cause:** Referenced ID doesn't exist
   **Solution:** Validate all foreign keys before mutation

   ```typescript
   // Verify instrument exists
   const instrument = await getInstrumentById(instrumentId);
   if (!instrument) {
     throw new Error("Invalid instrument ID");
   }
   ```

3. **"Unique constraint violation"**

   **Cause:** Duplicate unique field value
   **Solution:** Check for existing values before insert

   ```typescript
   const existingUser = await getUserByDisplayName(displayName);
   if (existingUser && existingUser.id !== userId) {
     throw new Error("Display name already taken");
   }
   ```

### Debugging Tips

1. **Enable Query Logging**

   ```typescript
   // In development
   const db = drizzle(sql, {
     logger: process.env.NODE_ENV === "development",
   });
   ```

2. **Use Database Transactions for Testing**

   ```typescript
   await db.transaction(async (tx) => {
     // Test mutations here
     // Rollback automatically on error
   });
   ```

3. **Validate Data Types**

   ```typescript
   // Ensure correct types
   console.log("Profile data:", JSON.stringify(profileData, null, 2));
   console.log("Instrument data:", JSON.stringify(instrumentData, null, 2));
   ```

---

## Migration Guide

### From Direct Database Calls

**Before (Direct Drizzle):**

```typescript
await db
  .update(users)
  .set({
    displayName: "John",
    bio: "Musician",
  })
  .where(eq(users.id, userId));
```

**After (Using Mutations):**

```typescript
await updateUserProfile(userId, {
  displayName: "John",
  bio: "Musician",
  age: null,
  showAge: false,
  city: "",
  region: "",
  country: "",
});
```

### Benefits of Using Mutations

1. **Type Safety** - Compile-time validation of data structures
2. **Consistency** - Standardized update patterns across the app
3. **Maintainability** - Centralized logic for database operations
4. **Testing** - Easier to mock and test database operations
5. **Error Handling** - Consistent error handling patterns

---

_Last updated: [Current Date]_
_For questions or issues, refer to the troubleshooting section or create an issue in the repository._
