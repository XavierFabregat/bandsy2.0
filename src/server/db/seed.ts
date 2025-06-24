import "../../envConfig";
import { db } from "./index";
import {
  instruments,
  genres,
  users,
  userInstruments,
  userGenres,
  mediaSamples,
} from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data (optional - be careful in production!)
    console.log("🧹 Clearing existing data...");
    // eslint-disable-next-line
    const safeDelete = async (table: any) => {
      try {
        // eslint-disable-next-line
        await db.delete(table);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(
            `Warning: Could not delete from table`,
            // eslint-disable-next-line
            table.id.name,
            err.message,
          );
        }
      }
    };

    await safeDelete(mediaSamples);
    await safeDelete(userGenres);
    await safeDelete(userInstruments);
    await safeDelete(users);
    await safeDelete(instruments);
    await safeDelete(genres);

    // Seed Instruments
    console.log("🎸 Seeding instruments...");
    const instrumentData = [
      // String Instruments
      { name: "Acoustic Guitar", category: "string" },
      { name: "Electric Guitar", category: "string" },
      { name: "Bass Guitar", category: "string" },
      { name: "Violin", category: "string" },
      { name: "Viola", category: "string" },
      { name: "Cello", category: "string" },
      { name: "Double Bass", category: "string" },
      { name: "Ukulele", category: "string" },
      { name: "Banjo", category: "string" },
      { name: "Mandolin", category: "string" },
      { name: "Harp", category: "string" },

      // Percussion Instruments
      { name: "Drum Kit", category: "percussion" },
      { name: "Snare Drum", category: "percussion" },
      { name: "Bass Drum", category: "percussion" },
      { name: "Cymbals", category: "percussion" },
      { name: "Congas", category: "percussion" },
      { name: "Bongos", category: "percussion" },
      { name: "Djembe", category: "percussion" },
      { name: "Tambourine", category: "percussion" },
      { name: "Maracas", category: "percussion" },
      { name: "Xylophone", category: "percussion" },
      { name: "Vibraphone", category: "percussion" },

      // Wind Instruments
      { name: "Saxophone", category: "wind" },
      { name: "Trumpet", category: "wind" },
      { name: "Trombone", category: "wind" },
      { name: "Flute", category: "wind" },
      { name: "Clarinet", category: "wind" },
      { name: "Oboe", category: "wind" },
      { name: "Bassoon", category: "wind" },
      { name: "French Horn", category: "wind" },
      { name: "Tuba", category: "wind" },
      { name: "Harmonica", category: "wind" },

      // Keyboard Instruments
      { name: "Piano", category: "keyboard" },
      { name: "Electric Piano", category: "keyboard" },
      { name: "Synthesizer", category: "keyboard" },
      { name: "Organ", category: "keyboard" },
      { name: "Accordion", category: "keyboard" },
      { name: "Melodica", category: "keyboard" },

      // Electronic Instruments
      { name: "DJ Controller", category: "electronic" },
      { name: "Drum Machine", category: "electronic" },
      { name: "MIDI Controller", category: "electronic" },
      { name: "Sampler", category: "electronic" },

      // Vocals
      { name: "Lead Vocals", category: "vocals" },
      { name: "Backing Vocals", category: "vocals" },
      { name: "Harmony Vocals", category: "vocals" },
    ];

    const insertedInstruments = await db
      .insert(instruments)
      .values(instrumentData)
      .returning();
    console.log(`✅ Inserted ${insertedInstruments.length} instruments`);

    // Seed Genres (with hierarchical structure)
    console.log("🎵 Seeding genres...");
    const genreData = [
      // Main Genres
      { name: "Rock", parentGenreId: null },
      { name: "Jazz", parentGenreId: null },
      { name: "Pop", parentGenreId: null },
      { name: "Classical", parentGenreId: null },
      { name: "Electronic", parentGenreId: null },
      { name: "Hip Hop", parentGenreId: null },
      { name: "Country", parentGenreId: null },
      { name: "Blues", parentGenreId: null },
      { name: "Folk", parentGenreId: null },
      { name: "R&B", parentGenreId: null },
      { name: "Reggae", parentGenreId: null },
      { name: "Latin", parentGenreId: null },
      { name: "World", parentGenreId: null },
      { name: "Metal", parentGenreId: null },
      { name: "Punk", parentGenreId: null },
      { name: "Indie", parentGenreId: null },
    ];

    const insertedGenres = await db
      .insert(genres)
      .values(genreData)
      .returning();
    console.log(`✅ Inserted ${insertedGenres.length} main genres`);

    // Find genre IDs for sub-genres
    const rockId = insertedGenres.find((g) => g.name === "Rock")?.id;
    const jazzId = insertedGenres.find((g) => g.name === "Jazz")?.id;
    const popId = insertedGenres.find((g) => g.name === "Pop")?.id;
    const classicalId = insertedGenres.find((g) => g.name === "Classical")?.id;
    const electronicId = insertedGenres.find(
      (g) => g.name === "Electronic",
    )?.id;
    const hipHopId = insertedGenres.find((g) => g.name === "Hip Hop")?.id;
    const countryId = insertedGenres.find((g) => g.name === "Country")?.id;
    const bluesId = insertedGenres.find((g) => g.name === "Blues")?.id;
    const folkId = insertedGenres.find((g) => g.name === "Folk")?.id;
    const rnbId = insertedGenres.find((g) => g.name === "R&B")?.id;
    const reggaeId = insertedGenres.find((g) => g.name === "Reggae")?.id;
    const latinId = insertedGenres.find((g) => g.name === "Latin")?.id;
    const worldId = insertedGenres.find((g) => g.name === "World")?.id;
    const metalId = insertedGenres.find((g) => g.name === "Metal")?.id;
    const punkId = insertedGenres.find((g) => g.name === "Punk")?.id;
    const indieId = insertedGenres.find((g) => g.name === "Indie")?.id;

    // Sub-genres
    const subGenreData = [
      // Rock sub-genres
      { name: "Classic Rock", parentGenreId: rockId },
      { name: "Hard Rock", parentGenreId: rockId },
      { name: "Progressive Rock", parentGenreId: rockId },
      { name: "Alternative Rock", parentGenreId: rockId },
      { name: "Grunge", parentGenreId: rockId },
      { name: "Psychedelic Rock", parentGenreId: rockId },
      { name: "Southern Rock", parentGenreId: rockId },

      // Jazz sub-genres
      { name: "Bebop", parentGenreId: jazzId },
      { name: "Smooth Jazz", parentGenreId: jazzId },
      { name: "Fusion", parentGenreId: jazzId },
      { name: "Big Band", parentGenreId: jazzId },
      { name: "Latin Jazz", parentGenreId: jazzId },
      { name: "Free Jazz", parentGenreId: jazzId },

      // Pop sub-genres
      { name: "Pop Rock", parentGenreId: popId },
      { name: "Synth Pop", parentGenreId: popId },
      { name: "Indie Pop", parentGenreId: popId },
      { name: "Electropop", parentGenreId: popId },
      { name: "Teen Pop", parentGenreId: popId },

      // Classical sub-genres
      { name: "Baroque", parentGenreId: classicalId },
      { name: "Romantic", parentGenreId: classicalId },
      { name: "Modern Classical", parentGenreId: classicalId },
      { name: "Chamber Music", parentGenreId: classicalId },
      { name: "Opera", parentGenreId: classicalId },

      // Electronic sub-genres
      { name: "House", parentGenreId: electronicId },
      { name: "Techno", parentGenreId: electronicId },
      { name: "Trance", parentGenreId: electronicId },
      { name: "Dubstep", parentGenreId: electronicId },
      { name: "Ambient", parentGenreId: electronicId },
      { name: "Drum & Bass", parentGenreId: electronicId },

      // Hip Hop sub-genres
      { name: "Old School Hip Hop", parentGenreId: hipHopId },
      { name: "Gangsta Rap", parentGenreId: hipHopId },
      { name: "Conscious Hip Hop", parentGenreId: hipHopId },
      { name: "Trap", parentGenreId: hipHopId },
      { name: "Alternative Hip Hop", parentGenreId: hipHopId },

      // Country sub-genres
      { name: "Country Rock", parentGenreId: countryId },
      { name: "Bluegrass", parentGenreId: countryId },
      { name: "Outlaw Country", parentGenreId: countryId },
      { name: "Contemporary Country", parentGenreId: countryId },

      // Blues sub-genres
      { name: "Delta Blues", parentGenreId: bluesId },
      { name: "Chicago Blues", parentGenreId: bluesId },
      { name: "Electric Blues", parentGenreId: bluesId },
      { name: "Blues Rock", parentGenreId: bluesId },

      // Folk sub-genres
      { name: "Traditional Folk", parentGenreId: folkId },
      { name: "Contemporary Folk", parentGenreId: folkId },
      { name: "Indie Folk", parentGenreId: folkId },
      { name: "Celtic Folk", parentGenreId: folkId },

      // R&B sub-genres
      { name: "Soul", parentGenreId: rnbId },
      { name: "Funk", parentGenreId: rnbId },
      { name: "Neo Soul", parentGenreId: rnbId },
      { name: "Contemporary R&B", parentGenreId: rnbId },

      // Reggae sub-genres
      { name: "Roots Reggae", parentGenreId: reggaeId },
      { name: "Dancehall", parentGenreId: reggaeId },
      { name: "Dub", parentGenreId: reggaeId },

      // Latin sub-genres
      { name: "Salsa", parentGenreId: latinId },
      { name: "Bossa Nova", parentGenreId: latinId },
      { name: "Flamenco", parentGenreId: latinId },
      { name: "Tango", parentGenreId: latinId },

      // World sub-genres
      { name: "African", parentGenreId: worldId },
      { name: "Middle Eastern", parentGenreId: worldId },
      { name: "Asian", parentGenreId: worldId },
      { name: "Caribbean", parentGenreId: worldId },

      // Metal sub-genres
      { name: "Heavy Metal", parentGenreId: metalId },
      { name: "Thrash Metal", parentGenreId: metalId },
      { name: "Death Metal", parentGenreId: metalId },
      { name: "Black Metal", parentGenreId: metalId },
      { name: "Power Metal", parentGenreId: metalId },

      // Punk sub-genres
      { name: "Hardcore Punk", parentGenreId: punkId },
      { name: "Pop Punk", parentGenreId: punkId },
      { name: "Post Punk", parentGenreId: punkId },
      { name: "Skate Punk", parentGenreId: punkId },

      // Indie sub-genres
      { name: "Indie Rock", parentGenreId: indieId },
      { name: "Lo-Fi", parentGenreId: indieId },
    ];

    const insertedSubGenres = await db
      .insert(genres)
      .values(subGenreData)
      .returning();
    console.log(`✅ Inserted ${insertedSubGenres.length} sub-genres`);

    // Sample Users (for testing)
    console.log("👥 Seeding sample users...");
    const sampleUsers = [
      {
        clerkId: "user_2sample1",
        username: "sarah_guitarist",
        displayName: "Sarah Chen",
        bio: "Passionate guitarist looking to form a rock band. Love playing classic rock and blues.",
        age: 28,
        showAge: true,
        city: "San Francisco",
        region: "California",
        country: "USA",
        latitude: "37.7749",
        longitude: "-122.4194",
        profileImageUrl:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
        isActive: true,
      },
      {
        clerkId: "user_2sample2",
        username: "mike_drummer",
        displayName: "Mike Rodriguez",
        bio: "Professional drummer with 10+ years experience. Into jazz, funk, and fusion.",
        age: 32,
        showAge: true,
        city: "Los Angeles",
        region: "California",
        country: "USA",
        latitude: "34.0522",
        longitude: "-118.2437",
        profileImageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        isActive: true,
      },
      {
        clerkId: "user_2sample3",
        username: "emma_vocalist",
        displayName: "Emma Thompson",
        bio: "Singer-songwriter with a love for indie folk and acoustic music. Looking for collaborators.",
        age: 25,
        showAge: false,
        city: "Portland",
        region: "Oregon",
        country: "USA",
        latitude: "45.5152",
        longitude: "-122.6784",
        profileImageUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        isActive: true,
      },
      {
        clerkId: "user_2sample4",
        username: "alex_bassist",
        displayName: "Alex Johnson",
        bio: "Bass player into funk, soul, and R&B. Love grooving with a tight rhythm section.",
        age: 30,
        showAge: true,
        city: "Austin",
        region: "Texas",
        country: "USA",
        latitude: "30.2672",
        longitude: "-97.7431",
        profileImageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        isActive: true,
      },
      {
        clerkId: "user_2sample5",
        username: "jessica_pianist",
        displayName: "Jessica Park",
        bio: "Classical pianist who also loves jazz and contemporary music. Seeking chamber music opportunities.",
        age: 27,
        showAge: true,
        city: "New York",
        region: "New York",
        country: "USA",
        latitude: "40.7128",
        longitude: "-74.006",
        profileImageUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        isActive: true,
      },
    ];

    const insertedUsers = await db
      .insert(users)
      .values(sampleUsers)
      .returning();
    console.log(`✅ Inserted ${insertedUsers.length} sample users`);

    // Sample User Instruments
    console.log("🎸 Seeding user instruments...");
    const userInstrumentData = [
      // Sarah - Guitarist
      {
        userId: insertedUsers[0]!.id,
        instrumentId: insertedInstruments.find(
          (i) => i.name === "Electric Guitar",
        )!.id,
        skillLevel: "advanced" as const,
        yearsOfExperience: 8,
        isPrimary: true,
      },
      {
        userId: insertedUsers[0]!.id,
        instrumentId: insertedInstruments.find(
          (i) => i.name === "Acoustic Guitar",
        )!.id,
        skillLevel: "advanced" as const,
        yearsOfExperience: 6,
        isPrimary: false,
      },

      // Mike - Drummer
      {
        userId: insertedUsers[1]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Drum Kit")!
          .id,
        skillLevel: "professional" as const,
        yearsOfExperience: 12,
        isPrimary: true,
      },
      {
        userId: insertedUsers[1]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Congas")!.id,
        skillLevel: "intermediate" as const,
        yearsOfExperience: 4,
        isPrimary: false,
      },

      // Emma - Vocalist
      {
        userId: insertedUsers[2]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Lead Vocals")!
          .id,
        skillLevel: "advanced" as const,
        yearsOfExperience: 7,
        isPrimary: true,
      },
      {
        userId: insertedUsers[2]!.id,
        instrumentId: insertedInstruments.find(
          (i) => i.name === "Acoustic Guitar",
        )!.id,
        skillLevel: "intermediate" as const,
        yearsOfExperience: 3,
        isPrimary: false,
      },

      // Alex - Bassist
      {
        userId: insertedUsers[3]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Bass Guitar")!
          .id,
        skillLevel: "professional" as const,
        yearsOfExperience: 10,
        isPrimary: true,
      },
      {
        userId: insertedUsers[3]!.id,
        instrumentId: insertedInstruments.find(
          (i) => i.name === "Electric Guitar",
        )!.id,
        skillLevel: "intermediate" as const,
        yearsOfExperience: 5,
        isPrimary: false,
      },

      // Jessica - Pianist
      {
        userId: insertedUsers[4]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Piano")!.id,
        skillLevel: "professional" as const,
        yearsOfExperience: 15,
        isPrimary: true,
      },
      {
        userId: insertedUsers[4]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Synthesizer")!
          .id,
        skillLevel: "advanced" as const,
        yearsOfExperience: 8,
        isPrimary: false,
      },
    ];

    await db.insert(userInstruments).values(userInstrumentData);
    console.log(`✅ Inserted ${userInstrumentData.length} user instruments`);

    // Sample User Genres
    console.log("🎵 Seeding user genres...");
    const userGenreData = [
      // Sarah's genres
      {
        userId: insertedUsers[0]!.id,
        genreId: insertedGenres.find((g) => g.name === "Rock")!.id,
        preference: 5,
      },
      {
        userId: insertedUsers[0]!.id,
        genreId: insertedGenres.find((g) => g.name === "Blues")!.id,
        preference: 4,
      },
      {
        userId: insertedUsers[0]!.id,
        genreId: insertedSubGenres.find((g) => g.name === "Classic Rock")!.id,
        preference: 5,
      },

      // Mike's genres
      {
        userId: insertedUsers[1]!.id,
        genreId: insertedGenres.find((g) => g.name === "Jazz")!.id,
        preference: 5,
      },
      {
        userId: insertedUsers[1]!.id,
        genreId: insertedSubGenres.find((g) => g.name === "Funk")!.id,
        preference: 4,
      },
      {
        userId: insertedUsers[1]!.id,
        genreId: insertedSubGenres.find((g) => g.name === "Fusion")!.id,
        preference: 5,
      },

      // Emma's genres
      {
        userId: insertedUsers[2]!.id,
        genreId: insertedGenres.find((g) => g.name === "Folk")!.id,
        preference: 5,
      },
      {
        userId: insertedUsers[2]!.id,
        genreId: insertedGenres.find((g) => g.name === "Indie")!.id,
        preference: 4,
      },
      {
        userId: insertedUsers[2]!.id,
        genreId: insertedSubGenres.find((g) => g.name === "Indie Folk")!.id,
        preference: 5,
      },

      // Alex's genres
      {
        userId: insertedUsers[3]!.id,
        genreId: insertedSubGenres.find((g) => g.name === "Funk")!.id,
        preference: 5,
      },
      {
        userId: insertedUsers[3]!.id,
        genreId: insertedSubGenres.find((g) => g.name === "Soul")!.id,
        preference: 4,
      },
      {
        userId: insertedUsers[3]!.id,
        genreId: insertedGenres.find((g) => g.name === "R&B")!.id,
        preference: 4,
      },

      // Jessica's genres
      {
        userId: insertedUsers[4]!.id,
        genreId: insertedGenres.find((g) => g.name === "Classical")!.id,
        preference: 5,
      },
      {
        userId: insertedUsers[4]!.id,
        genreId: insertedGenres.find((g) => g.name === "Jazz")!.id,
        preference: 4,
      },
      {
        userId: insertedUsers[4]!.id,
        genreId: insertedSubGenres.find((g) => g.name === "Chamber Music")!.id,
        preference: 5,
      },
    ];

    await db.insert(userGenres).values(userGenreData);
    console.log(`✅ Inserted ${userGenreData.length} user genres`);

    // Sample Media Samples
    console.log("🎤 Seeding media samples...");
    const mediaSampleData = [
      {
        userId: insertedUsers[0]!.id,
        instrumentId: insertedInstruments.find(
          (i) => i.name === "Electric Guitar",
        )!.id,
        title: "Classic Rock Riff",
        description: "A bluesy rock riff I've been working on",
        fileUrl: "https://example.com/audio/sarah-guitar-sample.mp3",
        fileType: "audio",
        duration: 45,
        metadata: { bpm: 120, key: "A minor" },
        isPublic: true,
      },
      {
        userId: insertedUsers[1]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Drum Kit")!
          .id,
        title: "Jazz Groove",
        description: "Smooth jazz drumming with brushes",
        fileUrl: "https://example.com/audio/mike-drums-sample.mp3",
        fileType: "audio",
        duration: 60,
        metadata: { bpm: 85, style: "jazz" },
        isPublic: true,
      },
      {
        userId: insertedUsers[2]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Lead Vocals")!
          .id,
        title: "Indie Folk Song",
        description: "Original song with acoustic guitar",
        fileUrl: "https://example.com/audio/emma-vocals-sample.mp3",
        fileType: "audio",
        duration: 180,
        metadata: { bpm: 95, key: "G major" },
        isPublic: true,
      },
      {
        userId: insertedUsers[3]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Bass Guitar")!
          .id,
        title: "Funk Bass Line",
        description: "Groovy funk bass with slap technique",
        fileUrl: "https://example.com/audio/alex-bass-sample.mp3",
        fileType: "audio",
        duration: 30,
        metadata: { bpm: 110, style: "funk" },
        isPublic: true,
      },
      {
        userId: insertedUsers[4]!.id,
        instrumentId: insertedInstruments.find((i) => i.name === "Piano")!.id,
        title: "Classical Piece",
        description: "Chopin Nocturne excerpt",
        fileUrl: "https://example.com/audio/jessica-piano-sample.mp3",
        fileType: "audio",
        duration: 120,
        metadata: { composer: "Chopin", piece: "Nocturne" },
        isPublic: true,
      },
    ];

    await db.insert(mediaSamples).values(mediaSampleData);
    console.log(`✅ Inserted ${mediaSampleData.length} media samples`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- ${insertedInstruments.length} instruments`);
    console.log(
      `- ${insertedGenres.length + insertedSubGenres.length} genres (${insertedGenres.length} main + ${insertedSubGenres.length} sub-genres)`,
    );
    console.log(`- ${insertedUsers.length} sample users`);
    console.log(`- ${userInstrumentData.length} user instruments`);
    console.log(`- ${userGenreData.length} user genres`);
    console.log(`- ${mediaSampleData.length} media samples`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("✅ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
