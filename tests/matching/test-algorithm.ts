import { CompositeScorer } from "../../src/lib/matching/algorithms/composite-scorer";
import type {
  UserMatchProfile,
  GenrePreference,
  InstrumentSkill,
  Location,
} from "../../src/lib/matching/types/matching-types";

// Mock data for testing
const mockLocations: Record<string, Location> = {
  sanFrancisco: {
    latitude: 37.7749,
    longitude: -122.4194,
    city: "San Francisco",
    region: "California",
    country: "USA",
  },
  oakland: {
    latitude: 37.8044,
    longitude: -122.2712,
    city: "Oakland",
    region: "California",
    country: "USA",
  },
  losAngeles: {
    latitude: 34.0522,
    longitude: -118.2437,
    city: "Los Angeles",
    region: "California",
    country: "USA",
  },
  nyc: {
    latitude: 40.7128,
    longitude: -74.006,
    city: "New York",
    region: "New York",
    country: "USA",
  },
  london: {
    latitude: 51.5074,
    longitude: -0.1278,
    city: "London",
    region: "England",
    country: "UK",
  },
};

const mockGenres: Record<string, GenrePreference> = {
  rock: { id: "1", name: "Rock", preference: 5 },
  jazz: { id: "2", name: "Jazz", preference: 4 },
  blues: { id: "3", name: "Blues", preference: 4 },
  indie: { id: "4", name: "Indie Rock", preference: 5, parentGenreId: "1" },
  classical: { id: "5", name: "Classical", preference: 3 },
  electronic: { id: "6", name: "Electronic", preference: 2 },
  metal: { id: "7", name: "Metal", preference: 4 },
  folk: { id: "8", name: "Folk", preference: 3 },
  reggae: { id: "9", name: "Reggae", preference: 2 },
  country: { id: "10", name: "Country", preference: 3 },
  punk: { id: "11", name: "Punk", preference: 5 },
};

const mockInstruments: Record<string, InstrumentSkill> = {
  guitar: {
    id: "1",
    name: "guitar",
    category: "string",
    skillLevel: "advanced",
    yearsOfExperience: 8,
    isPrimary: true,
  },
  bass: {
    id: "2",
    name: "bass",
    category: "string",
    skillLevel: "intermediate",
    yearsOfExperience: 5,
    isPrimary: true,
  },
  drums: {
    id: "3",
    name: "drums",
    category: "percussion",
    skillLevel: "advanced",
    yearsOfExperience: 10,
    isPrimary: true,
  },
  keyboard: {
    id: "4",
    name: "keyboard",
    category: "keyboard",
    skillLevel: "intermediate",
    yearsOfExperience: 6,
    isPrimary: true,
  },
  vocals: {
    id: "5",
    name: "vocals",
    category: "voice",
    skillLevel: "advanced",
    yearsOfExperience: 7,
    isPrimary: true,
  },
  violin: {
    id: "6",
    name: "violin",
    category: "string",
    skillLevel: "expert",
    yearsOfExperience: 15,
    isPrimary: true,
  },
  saxophone: {
    id: "7",
    name: "saxophone",
    category: "wind",
    skillLevel: "intermediate",
    yearsOfExperience: 4,
    isPrimary: false,
  },
};

// Create mock user profiles
const mockUsers: UserMatchProfile[] = [
  {
    id: "profile1",
    userId: "user1",
    location: mockLocations.sanFrancisco!,
    genres: [mockGenres.rock!, mockGenres.indie!, mockGenres.blues!],
    instruments: [
      mockInstruments.guitar!,
      {
        id: "5-copy",
        name: "vocals",
        category: "voice",
        skillLevel: "advanced" as const,
        yearsOfExperience: 7,
        isPrimary: false,
      },
    ],
    skillLevelAverage: 3.5,
    activityScore: 85,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isActive: true,
    searchRadius: 50,
    ageRange: { min: 22, max: 35 },
    lookingFor: "band",
    updatedAt: new Date(),
  },
  {
    id: "profile2",
    userId: "user2",
    location: mockLocations.oakland!,
    genres: [mockGenres.rock!, mockGenres.metal!, mockGenres.blues!],
    instruments: [mockInstruments.bass!],
    skillLevelAverage: 3.0,
    activityScore: 92,
    lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isActive: true,
    searchRadius: 75,
    ageRange: { min: 25, max: 40 },
    lookingFor: "band",
    updatedAt: new Date(),
  },
  {
    id: "profile3",
    userId: "user3",
    location: mockLocations.sanFrancisco!,
    genres: [mockGenres.jazz!, mockGenres.blues!, mockGenres.classical!],
    instruments: [
      mockInstruments.drums!,
      {
        id: "4-copy",
        name: "keyboard",
        category: "keyboard",
        skillLevel: "intermediate" as const,
        yearsOfExperience: 6,
        isPrimary: false,
      },
    ],
    skillLevelAverage: 4.0,
    activityScore: 78,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isActive: true,
    searchRadius: 30,
    ageRange: { min: 28, max: 45 },
    lookingFor: "jam_session",
    updatedAt: new Date(),
  },
  {
    id: "profile4",
    userId: "user4",
    location: mockLocations.losAngeles!,
    genres: [mockGenres.indie!, mockGenres.folk!, mockGenres.electronic!],
    instruments: [
      mockInstruments.keyboard!,
      {
        id: "5-copy2",
        name: "vocals",
        category: "voice",
        skillLevel: "advanced" as const,
        yearsOfExperience: 7,
        isPrimary: false,
      },
    ],
    skillLevelAverage: 2.5,
    activityScore: 65,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isActive: true,
    searchRadius: 100,
    ageRange: { min: 20, max: 30 },
    lookingFor: "collaboration",
    updatedAt: new Date(),
  },
  {
    id: "profile5",
    userId: "user5",
    location: mockLocations.nyc!,
    genres: [mockGenres.jazz!, mockGenres.classical!],
    instruments: [
      mockInstruments.violin!,
      {
        id: "4-expert",
        name: "keyboard",
        category: "keyboard",
        skillLevel: "expert" as const,
        yearsOfExperience: 12,
        isPrimary: false,
      },
    ],
    skillLevelAverage: 4.5,
    activityScore: 95,
    lastActive: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    isActive: true,
    searchRadius: 25,
    ageRange: { min: 30, max: 50 },
    lookingFor: "any",
    updatedAt: new Date(),
  },
  {
    id: "profile6",
    userId: "user6",
    location: mockLocations.london!,
    genres: [mockGenres.rock!, mockGenres.punk!, mockGenres.reggae!],
    instruments: [
      {
        id: "1-expert",
        name: "guitar",
        category: "string",
        skillLevel: "expert" as const,
        yearsOfExperience: 12,
        isPrimary: true,
      },
      mockInstruments.vocals!,
    ],
    skillLevelAverage: 4.0,
    activityScore: 88,
    lastActive: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    isActive: true,
    searchRadius: 40,
    ageRange: { min: 25, max: 40 },
    lookingFor: "band",
    updatedAt: new Date(),
  },
];

// Test scenarios
export function runMatchingTests() {
  console.log("🎵 Testing Bandsy Matching Algorithm\n");
  console.log("=".repeat(60));

  // Test 1: Perfect rhythm section match (guitarist + bassist + drummer)
  console.log("\n🥁 Test 1: Rhythm Section Compatibility");
  console.log("-".repeat(40));
  const guitarist = mockUsers[0]!; // Rock guitarist from SF
  const bassist = mockUsers[1]!; // Rock bassist from Oakland (nearby)
  const drummer = mockUsers[2]!; // Jazz/blues drummer from SF

  console.log(
    `Guitarist: ${guitarist.instruments[0]!.name} (${guitarist.location.city})`,
  );
  console.log(`Genres: ${guitarist.genres.map((g) => g.name).join(", ")}`);

  const guitaristVsBassist = CompositeScorer.calculate(guitarist, bassist);
  console.log(`\n📊 Guitarist vs Bassist: ${guitaristVsBassist.overall}/100`);
  console.log(`Factors:`, guitaristVsBassist.factors);
  console.log(`Explanation: ${guitaristVsBassist.explanation.join(", ")}`);
  console.log(
    `Confidence: ${Math.round(guitaristVsBassist.confidence * 100)}%`,
  );

  const guitaristVsDrummer = CompositeScorer.calculate(guitarist, drummer);
  console.log(`\n📊 Guitarist vs Drummer: ${guitaristVsDrummer.overall}/100`);
  console.log(`Factors:`, guitaristVsDrummer.factors);
  console.log(`Explanation: ${guitaristVsDrummer.explanation.join(", ")}`);
  console.log(
    `Confidence: ${Math.round(guitaristVsDrummer.confidence * 100)}%`,
  );

  // Test 2: Genre mismatch but instrument complement
  console.log("\n\n🎼 Test 2: Genre Mismatch vs Instrument Compatibility");
  console.log("-".repeat(50));
  const indieKeyboardist = mockUsers[3]!; // Indie/electronic from LA
  const rockGuitarist = mockUsers[0]!; // Rock guitarist from SF

  console.log(
    `Indie Keyboardist: ${indieKeyboardist.genres.map((g) => g.name).join(", ")}`,
  );
  console.log(
    `Rock Guitarist: ${rockGuitarist.genres.map((g) => g.name).join(", ")}`,
  );

  const genreMismatch = CompositeScorer.calculate(
    indieKeyboardist,
    rockGuitarist,
  );
  console.log(`\n📊 Score: ${genreMismatch.overall}/100`);
  console.log(`Factors:`, genreMismatch.factors);
  console.log(`Explanation: ${genreMismatch.explanation.join(", ")}`);

  // Test 3: Distance impact
  console.log("\n\n🌍 Test 3: Geographic Distance Impact");
  console.log("-".repeat(40));
  const sfMusician = mockUsers[0]!; // San Francisco
  const nycMusician = mockUsers[4]!; // New York (3000+ miles away)

  console.log(`SF to NYC distance test...`);
  const longDistance = CompositeScorer.calculate(sfMusician, nycMusician);
  console.log(`\n📊 Score: ${longDistance.overall}/100`);
  console.log(`Factors:`, longDistance.factors);
  console.log(`Location score impact: ${longDistance.factors.location}/100`);

  // Test 4: Skill level compatibility
  console.log("\n\n⭐ Test 4: Skill Level Differences");
  console.log("-".repeat(35));
  const expertViolinist = mockUsers[4]!; // Expert level (4.5 avg)
  const beginnerKeyboardist = mockUsers[3]!; // Intermediate level (2.5 avg)

  console.log(
    `Expert (${expertViolinist.skillLevelAverage}) vs Beginner (${beginnerKeyboardist.skillLevelAverage})`,
  );
  const skillGap = CompositeScorer.calculate(
    expertViolinist,
    beginnerKeyboardist,
  );
  console.log(`\n📊 Score: ${skillGap.overall}/100`);
  console.log(`Experience factor: ${skillGap.factors.experience}/100`);

  // Test 5: Complete band compatibility matrix
  console.log("\n\n🎸 Test 5: Band Formation Matrix");
  console.log("-".repeat(35));
  const bandCandidates = [guitarist, bassist, drummer];

  console.log("Compatibility Matrix:");
  console.log("     ", bandCandidates.map((_, i) => `User${i + 1}`).join("  "));

  bandCandidates.forEach((user1, i) => {
    let row = `User${i + 1} `;
    bandCandidates.forEach((user2, j) => {
      if (i === j) {
        row += "  --  ";
      } else {
        const score = CompositeScorer.calculate(user1, user2);
        row += ` ${score.overall.toString().padStart(2)} `;
      }
    });
    console.log(row);
  });

  // Test 6: Activity and freshness impact
  console.log("\n\n⏰ Test 6: Activity Score Impact");
  console.log("-".repeat(30));
  const activeUser = mockUsers[4]!; // 95 activity, recent
  const lessActiveUser = mockUsers[3]!; // 65 activity, 3 days ago

  console.log(
    `Active user (score: ${activeUser.activityScore}, last active: ${activeUser.lastActive.toLocaleString()})`,
  );
  console.log(
    `Less active user (score: ${lessActiveUser.activityScore}, last active: ${lessActiveUser.lastActive.toLocaleString()})`,
  );

  const activityTest = CompositeScorer.calculate(activeUser, lessActiveUser);
  console.log(`\n📊 Score: ${activityTest.overall}/100`);
  console.log(`Activity factor: ${activityTest.factors.activity}/100`);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Algorithm testing complete!");
  console.log("\nKey insights:");
  console.log("• Location proximity significantly impacts matching");
  console.log("• Complementary instruments boost compatibility");
  console.log("• Genre overlap is heavily weighted");
  console.log("• Skill level gaps can reduce matches");
  console.log("• Activity scores influence discoverability");
}

// Helper function to test specific user pairs
export function testUserPair(
  user1: UserMatchProfile,
  user2: UserMatchProfile,
  description?: string,
) {
  console.log(`\n🎵 ${description ?? "Testing user pair"}`);
  console.log("-".repeat(40));

  const score = CompositeScorer.calculate(user1, user2);

  console.log(
    `User 1: ${user1.instruments[0]?.name} player from ${user1.location.city}`,
  );
  console.log(`Genres: ${user1.genres.map((g) => g.name).join(", ")}`);
  console.log(
    `User 2: ${user2.instruments[0]?.name} player from ${user2.location.city}`,
  );
  console.log(`Genres: ${user2.genres.map((g) => g.name).join(", ")}`);

  console.log(`\n📊 Overall Score: ${score.overall}/100`);
  console.log(`📍 Location: ${score.factors.location}/100`);
  console.log(`🎼 Genres: ${score.factors.genres}/100`);
  console.log(`🎸 Instruments: ${score.factors.instruments}/100`);
  console.log(`⭐ Experience: ${score.factors.experience}/100`);
  console.log(`📱 Activity: ${score.factors.activity}/100`);
  console.log(`🎯 Confidence: ${Math.round(score.confidence * 100)}%`);
  console.log(`💡 Explanation: ${score.explanation.join(", ")}`);

  return score;
}

// Export mock data for external testing
export { mockUsers, mockLocations, mockGenres, mockInstruments };
