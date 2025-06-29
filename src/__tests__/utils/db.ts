import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/server/db/schema";

// Create a test database connection
const testDbUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://test:test@localhost:5432/test_bandsy";

export const testDb = drizzle(postgres(testDbUrl), { schema });

export const resetTestDb = async () => {
  // Clean up test data between tests
  await testDb.delete(schema.userGenres);
  await testDb.delete(schema.userInstruments);
  await testDb.delete(schema.users);
  await testDb.delete(schema.genres);
  await testDb.delete(schema.instruments);
};

export const createTestUser = async (
  overrides: Partial<typeof schema.users.$inferInsert> = {},
) => {
  const defaultUser = {
    id: "test-user-id",
    username: "testuser",
    clerkId: "test-clerk-id",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    imageUrl: "https://example.com/avatar.jpg",
    displayName: "Test User",
    ...overrides,
  };

  const [user] = await testDb
    .insert(schema.users)
    .values(defaultUser)
    .returning();
  return user;
};

export const createTestGenre = async (
  overrides: Partial<typeof schema.genres.$inferInsert> = {},
) => {
  const defaultGenre = {
    name: "Rock",
    ...overrides,
  };

  const [genre] = await testDb
    .insert(schema.genres)
    .values(defaultGenre)
    .returning();
  return genre;
};

export const createTestInstrument = async (
  overrides: Partial<typeof schema.instruments.$inferInsert> = {},
) => {
  const defaultInstrument = {
    name: "Guitar",
    category: "String" as const,
    ...overrides,
  };

  const [instrument] = await testDb
    .insert(schema.instruments)
    .values(defaultInstrument)
    .returning();
  return instrument;
};
