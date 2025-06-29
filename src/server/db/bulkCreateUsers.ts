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

// Catalonia cities and towns with coordinates
const cataloniaCities = [
  // Major cities
  { name: "Barcelona", lat: 41.3851, lng: 2.1734, population: 1620000 },
  {
    name: "L'Hospitalet de Llobregat",
    lat: 41.3596,
    lng: 2.1075,
    population: 252000,
  },
  { name: "Terrassa", lat: 41.5639, lng: 2.0084, population: 218000 },
  { name: "Badalona", lat: 41.4502, lng: 2.2445, population: 216000 },
  { name: "Sabadell", lat: 41.5431, lng: 2.1089, population: 210000 },
  { name: "Lleida", lat: 41.6176, lng: 0.62, population: 140000 },
  { name: "Tarragona", lat: 41.1189, lng: 1.2445, population: 135000 },
  { name: "Mataró", lat: 41.5339, lng: 2.4455, population: 130000 },
  {
    name: "Santa Coloma de Gramenet",
    lat: 41.4519,
    lng: 2.2081,
    population: 118000,
  },
  { name: "Reus", lat: 41.1561, lng: 1.107, population: 107000 },

  // Medium cities
  { name: "Girona", lat: 41.9794, lng: 2.8214, population: 103000 },
  { name: "Manresa", lat: 41.7286, lng: 1.8262, population: 77000 },
  { name: "Rubí", lat: 41.4928, lng: 2.0331, population: 76000 },
  {
    name: "Vilanova i la Geltrú",
    lat: 41.2236,
    lng: 1.7256,
    population: 67000,
  },
  { name: "Castelldefels", lat: 41.2814, lng: 1.9756, population: 66000 },
  { name: "Granollers", lat: 41.6077, lng: 2.2877, population: 61000 },
  {
    name: "Cerdanyola del Vallès",
    lat: 41.4914,
    lng: 2.1406,
    population: 58000,
  },
  {
    name: "Cornellà de Llobregat",
    lat: 41.3533,
    lng: 2.0747,
    population: 87000,
  },
  {
    name: "Sant Boi de Llobregat",
    lat: 41.3428,
    lng: 2.0372,
    population: 83000,
  },
  {
    name: "Esplugues de Llobregat",
    lat: 41.3772,
    lng: 2.0892,
    population: 46000,
  },

  // Smaller towns
  { name: "Sitges", lat: 41.2373, lng: 1.805, population: 29000 },
  { name: "Figueres", lat: 42.2677, lng: 2.9614, population: 46000 },
  { name: "Blanes", lat: 41.675, lng: 2.7928, population: 39000 },
  { name: "Lloret de Mar", lat: 41.6958, lng: 2.8456, population: 40000 },
  { name: "Olot", lat: 42.1817, lng: 2.4889, population: 35000 },
  { name: "Vic", lat: 41.9304, lng: 2.2553, population: 45000 },
  { name: "Igualada", lat: 41.5789, lng: 1.6175, population: 40000 },
  {
    name: "El Prat de Llobregat",
    lat: 41.3258,
    lng: 2.0958,
    population: 64000,
  },
  { name: "Gavà", lat: 41.3061, lng: 2.0014, population: 46000 },
  { name: "Mollet del Vallès", lat: 41.5419, lng: 2.2136, population: 52000 },
];

// Spanish/Catalan names for realistic users
const catalanNames = {
  male: [
    "Marc",
    "Pau",
    "Jordi",
    "David",
    "Àlex",
    "Daniel",
    "Adrià",
    "Gerard",
    "Pol",
    "Arnau",
    "Roger",
    "Oriol",
    "Martí",
    "Nil",
    "Biel",
    "Jan",
    "Iker",
    "Carles",
    "Miquel",
    "Bernat",
    "Xavier",
    "Ferran",
    "Albert",
    "Ricard",
    "Josep",
    "Francesc",
    "Antoni",
    "Raül",
    "Sergi",
    "Lluís",
  ],
  female: [
    "Laia",
    "Júlia",
    "Paula",
    "Martina",
    "Emma",
    "Carla",
    "Noa",
    "Clàudia",
    "Aina",
    "Maria",
    "Marta",
    "Anna",
    "Berta",
    "Irene",
    "Laura",
    "Ariadna",
    "Nuria",
    "Clara",
    "Cristina",
    "Mireia",
    "Montserrat",
    "Teresa",
    "Pilar",
    "Carmen",
    "Rosa",
    "Dolors",
    "Mercè",
    "Joana",
    "Elisabet",
    "Sílvia",
  ],
};

const catalanSurnames = [
  "García",
  "Martínez",
  "López",
  "Sánchez",
  "González",
  "Hernández",
  "Rodríguez",
  "Pérez",
  "Gómez",
  "Martín",
  "Jiménez",
  "Ruiz",
  "Fernández",
  "Díaz",
  "Moreno",
  "Muñoz",
  "Álvarez",
  "Romero",
  "Alonso",
  "Gutiérrez",
  "Navarro",
  "Torres",
  "Domínguez",
  "Vázquez",
  "Ramos",
  "Gil",
  "Ramírez",
  "Serrano",
  "Blanco",
  "Suárez",
  "Molina",
  "Morales",
  "Ortega",
  "Delgado",
  "Castro",
  "Ortiz",
  "Rubio",
  "Marín",
  "Sanz",
  "Iglesias",
  "Vila",
  "Puig",
  "Serra",
  "Bosch",
  "Ferrer",
  "Vidal",
  "Soler",
  "Mas",
  "Roca",
  "Pons",
];

// Music-related bios in Spanish/Catalan context
const musicBios = [
  "Músic apassionat de Barcelona buscant formar una banda de rock català.",
  "Guitarrista amb 10 anys d'experiència, especialitzat en rock i blues.",
  "Cantant i compositora, m'encanta la música indie i el folk català.",
  "Bateria professional amb experiència en jazz i fusió.",
  "Baixista funky buscant col·laboracions per a projectes de soul i R&B.",
  "Pianista clàssic també interessat en jazz contemporani.",
  "Violinista amb formació clàssica, oberta a nous estils musicals.",
  "Saxofonista de jazz amb ganes de tocar en directe.",
  "Productor musical i DJ especialitzat en música electrònica.",
  "Cantautor amb guitarra acústica, influències de Lluís Llach i Serrat.",
  "Músic de carrer amb harmònica i guitarra, estil blues mediterrani.",
  "Percussionista amb experiència en música latina i flamenc.",
  "Cellista buscant ensemble de cambra per a concerts.",
  "Trompetista interessat en big band i música swing.",
  "Cantant lírica amb formació al Liceu de Barcelona.",
];

// Generate random user data
function generateRandomUser(index: number) {
  const isMale = Math.random() > 0.5;
  const firstName = isMale
    ? catalanNames.male[Math.floor(Math.random() * catalanNames.male.length)]
    : catalanNames.female[
        Math.floor(Math.random() * catalanNames.female.length)
      ];

  const surname =
    catalanSurnames[Math.floor(Math.random() * catalanSurnames.length)];
  const username = `${firstName?.toLowerCase()}_${surname?.toLowerCase()}${Math.floor(Math.random() * 999)}`;
  const displayName = `${firstName} ${surname}`;

  // Weight distribution towards larger cities
  const cityWeights = cataloniaCities.map((city) => Math.sqrt(city.population));
  const totalWeight = cityWeights.reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  let selectedCity = cataloniaCities[0];

  for (let i = 0; i < cataloniaCities.length; i++) {
    cumulativeWeight += cityWeights[i]!;
    if (random <= cumulativeWeight) {
      selectedCity = cataloniaCities[i]!;
      break;
    }
  }

  // Add some random variation to coordinates (within ~5km)
  const latVariation = (Math.random() - 0.5) * 0.05;
  const lngVariation = (Math.random() - 0.5) * 0.05;

  return {
    clerkId: `user_cat_${index.toString().padStart(4, "0")}`,
    username,
    displayName,
    bio: musicBios[Math.floor(Math.random() * musicBios.length)],
    age: Math.floor(Math.random() * 40) + 18, // 18-58
    showAge: Math.random() > 0.3, // 70% show age
    city: selectedCity!.name,
    region: "Catalunya",
    country: "España",
    latitude: (selectedCity!.lat + latVariation).toFixed(6),
    longitude: (selectedCity!.lng + lngVariation).toFixed(6),
    profileImageUrl: `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=400&fit=crop&crop=face`,
    isActive: Math.random() > 0.1, // 90% active
    lastActiveAt: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    ), // Within last 30 days
  };
}

async function seed() {
  console.log("🌱 Seeding database with Catalonia data...");

  try {
    // Generate users
    console.log("👥 Generating Catalan users...");
    const numberOfUsers = 150; // Generate 150 users
    const userData = [];

    for (let i = 0; i < numberOfUsers; i++) {
      userData.push(generateRandomUser(i));
    }

    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    const dbInstruments = await db.select().from(instruments);
    const dbGenres = await db.select().from(genres);
    // Generate user instruments
    console.log("🎸 Generating user instruments...");
    const userInstrumentData = [];

    for (const user of insertedUsers) {
      // Each user has 1-4 instruments
      const numInstruments = Math.floor(Math.random() * 4) + 1;
      const userInstruments_shuffled = [...dbInstruments].sort(
        () => Math.random() - 0.5,
      );

      for (let i = 0; i < numInstruments; i++) {
        const instrument = userInstruments_shuffled[i];
        if (instrument) {
          userInstrumentData.push({
            userId: user.id,
            instrumentId: instrument.id,
            skillLevel: [
              "beginner",
              "intermediate",
              "advanced",
              "professional",
            ][Math.floor(Math.random() * 4)] as
              | "beginner"
              | "intermediate"
              | "advanced"
              | "professional",
            yearsOfExperience: Math.floor(Math.random() * 20) + 1,
            isPrimary: i === 0, // First instrument is primary
          });
        }
      }
    }

    await db.insert(userInstruments).values(userInstrumentData);
    console.log(`✅ Inserted ${userInstrumentData.length} user instruments`);

    // Generate user genres
    console.log("🎵 Generating user genres...");
    const userGenreData = [];

    for (const user of insertedUsers) {
      // Each user has 2-6 genres
      const numGenres = Math.floor(Math.random() * 5) + 2;
      const userGenres_shuffled = [...dbGenres].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numGenres; i++) {
        const genre = userGenres_shuffled[i];
        if (genre) {
          userGenreData.push({
            userId: user.id,
            genreId: genre.id,
            preference: Math.floor(Math.random() * 3) + 3, // 3-5 preference
          });
        }
      }
    }

    await db.insert(userGenres).values(userGenreData);
    console.log(`✅ Inserted ${userGenreData.length} user genres`);

    // Generate sample media files
    console.log("🎤 Generating media samples...");
    const mediaSampleData = [];
    const sampleTitles = [
      "Improvisación de Blues",
      "Riff de Rock Català",
      "Melodía de Sardana",
      "Solo de Jazz",
      "Ritmo Flamenco",
      "Balada Acústica",
      "Groove Funky",
      "Tema Original",
      "Cover de Manel",
      "Instrumental Clásico",
      "Beat Electrónico",
      "Harmonies Vocals",
      "Percusión Latina",
    ];

    // 30% of users have samples
    const usersWithSamples = insertedUsers.filter(() => Math.random() < 0.3);

    for (const user of usersWithSamples) {
      const numSamples = Math.floor(Math.random() * 3) + 1; // 1-3 samples per user

      for (let i = 0; i < numSamples; i++) {
        const title =
          sampleTitles[Math.floor(Math.random() * sampleTitles.length)];

        mediaSampleData.push({
          userId: user.id,
          instrumentId:
            dbInstruments[Math.floor(Math.random() * dbInstruments.length)]!.id,
          title: `${title} ${i + 1}`,
          description: `Sample musical grabado en ${user.city}`,
          fileUrl: `https://example.com/samples/${user.username}_${i + 1}.mp3`,
          fileType: "audio",
          duration: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
          metadata: {
            bpm: Math.floor(Math.random() * 80) + 80, // 80-160 BPM
            key: ["C", "D", "E", "F", "G", "A", "B"][
              Math.floor(Math.random() * 7)
            ],
            location: user.city,
          },
          isPublic: Math.random() > 0.2, // 80% public
        });
      }
    }

    await db.insert(mediaSamples).values(mediaSampleData);
    console.log(`✅ Inserted ${mediaSampleData.length} media samples`);

    console.log("🎉 Catalonia database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- ${dbInstruments.length} instruments`);
    console.log(`- ${dbGenres.length} genres`);
    console.log(
      `- ${insertedUsers.length} users from ${cataloniaCities.length} Catalan cities`,
    );
    console.log(`- ${userInstrumentData.length} user instruments`);
    console.log(`- ${userGenreData.length} user genres`);
    console.log(`- ${mediaSampleData.length} media samples`);
    console.log(
      `- Cities covered: ${cataloniaCities.map((c) => c.name).join(", ")}`,
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("✅ Catalonia seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
