# Bandsy - Music Collaboration Platform

Bandsy is a modern music collaboration platform that connects musicians based on their instruments, genres, location, and skill levels. Built with the T3 Stack and featuring a sophisticated matching algorithm.

## 🎵 Features

- **Smart Matching Algorithm**: Connects musicians using multi-factor compatibility scoring
- **Real-time Notifications**: Server-Sent Events (SSE) for instant likes, matches, and updates
- **Audio Sample Uploads**: Showcase your musical talents with audio/video samples
- **Geographic Discovery**: Find nearby musicians within your preferred radius
- **Skill-Based Matching**: Connect with musicians at compatible experience levels
- **Genre Compatibility**: Advanced genre hierarchy with preference weighting
- **Real-time Performance**: 240,000+ compatibility calculations per second

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account for authentication
- UploadThing account for file storage

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bandsy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your environment variables

# Set up the database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# File Upload (UploadThing)
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."
```

## 🧪 Testing

### Matching Algorithm Tests

```bash
# Run all matching algorithm tests
npm run test:matching:all

# Run algorithm tests only
npm run test:matching

# Run performance tests only
npm run test:matching:perf

# Alternative: Use the shell script
./test-matching.sh
```

### Test Coverage

- **Algorithm Accuracy**: Comprehensive compatibility scoring validation
- **Performance Benchmarks**: Speed and scalability testing
- **Edge Cases**: Geographic extremes, genre mismatches, skill gaps
- **Real-world Scenarios**: Rhythm section formation, collaboration types

See `tests/README.md` for detailed testing documentation.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API routes, Drizzle ORM
- **Database**: PostgreSQL with PostGIS for geospatial queries
- **Authentication**: Clerk
- **File Storage**: UploadThing CDN
- **Deployment**: Vercel

### Key Components

- **Matching Algorithm** (`src/lib/matching/`): Multi-factor compatibility scoring
- **Notifications System** (`src/lib/notifications/`): Real-time SSE notifications
- **Sample Management** (`src/app/samples/`): Audio upload and playback
- **User Profiles** (`src/app/profile/`): Setup wizard and profile management
- **Discovery** (`src/app/browse/`): User browsing and filtering

## 📊 Matching Algorithm

The heart of Bandsy is a sophisticated matching algorithm that scores compatibility based on:

- **Location (25%)**: Geographic proximity with distance decay
- **Genres (30%)**: Musical style compatibility with preference weighting
- **Instruments (25%)**: Complementarity and role-based matching
- **Experience (10%)**: Skill level alignment
- **Activity (10%)**: Platform engagement rewards

### Performance Metrics

- **Speed**: 240,000+ calculations/second
- **Latency**: <1ms for 100 candidates
- **Memory**: ~755 bytes per user profile
- **Scalability**: Production-ready for 100,000+ users

See `src/lib/matching/README.md` for detailed algorithm documentation.

## 🔔 Real-time Notifications

Bandsy features a comprehensive notifications system using Server-Sent Events (SSE) for real-time updates:

### Features

- **Real-time delivery**: Instant notifications via SSE connections
- **Cross-browser support**: Works on Chrome, Safari, Firefox, and Edge
- **Flexible types**: Likes, super likes, matches, messages, and system updates
- **Browser integration**: Native OS notifications with permission handling
- **Automatic reconnection**: Resilient connections with exponential backoff
- **Type-safe**: Full TypeScript support with discriminated unions

### Supported Notification Types

- `like_received` - Profile likes and super likes
- `match_created` - New mutual matches
- `message_received` - Chat messages
- `profile_viewed` - Profile views
- `group_invitation` - Group invitations
- `event_reminder` - Event notifications
- `system_update` - Platform announcements

### Performance

- **Connection management**: Persistent connections across dev reloads
- **Memory efficient**: Automatic cleanup and connection pooling
- **Low latency**: <100ms delivery time
- **Scalable**: Ready for multi-server deployments with Redis

See `docs/NOTIFICATIONS_SYSTEM.md` for complete system documentation.

## 🗃️ Database Schema

Comprehensive PostgreSQL schema supporting:

- User profiles and authentication
- Instrument and genre hierarchies
- Geographic matching with PostGIS
- Audio/video sample metadata
- Real-time messaging system
- Premium subscription features

See `docs/DATABASE_SCHEMA.md` for complete schema documentation.

## 📁 Project Structure

```
bandsy/
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # Reusable UI components
│   ├── lib/
│   │   └── matching/          # Matching algorithm system
│   └── server/
│       ├── db/                # Database schema and queries
│       ├── mutations.ts       # Data modification operations
│       └── queries.ts         # Data fetching operations
├── tests/
│   └── matching/              # Algorithm test suite
├── docs/                      # Documentation
└── drizzle/                   # Database migrations
```

## 🚀 Development

### Available Scripts

```bash
# Development
npm run dev                    # Start dev server with Turbo
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run db:push               # Push schema changes
npm run db:generate           # Generate migrations
npm run db:migrate            # Run migrations
npm run db:seed               # Seed with sample data
npm run db:studio             # Open Drizzle Studio

# Testing
npm run test:matching:all     # Run all matching tests
npm run test:matching         # Algorithm tests only
npm run test:matching:perf    # Performance tests only

# Code Quality
npm run lint                  # ESLint
npm run lint:fix              # Fix ESLint issues
npm run typecheck             # TypeScript validation
npm run format:check          # Prettier check
npm run format:write          # Format code
```

### Adding New Features

1. **Algorithm Changes**: Modify `src/lib/matching/algorithms/`
2. **Database Changes**: Update `src/server/db/schema.ts`
3. **UI Components**: Add to `src/components/` or `src/app/`
4. **API Routes**: Create in `src/app/api/`
5. **Tests**: Add to `tests/matching/` for algorithm features

## 🌟 Key Features Detail

### Smart Matching

- Haversine distance calculation for geographic precision
- Weighted Jaccard similarity for genre compatibility

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

### Core System Documentation

- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Complete database structure and relationships
- **[Query Documentation](docs/DOCS_QUERIES.md)** - Database query patterns and examples
- **[Mutations Documentation](docs/DOCS_MUTATIONS.md)** - Data modification operations

### Notifications System

- **[Notifications System](docs/NOTIFICATIONS_SYSTEM.md)** - Complete guide to the real-time notifications system
- **[SSE Implementation](docs/SSE_IMPLEMENTATION.md)** - Technical details of Server-Sent Events implementation
- **[Troubleshooting Guide](docs/NOTIFICATIONS_TROUBLESHOOTING.md)** - Common issues and solutions

### Algorithm Documentation

- **[Matching Algorithm](src/lib/matching/README.md)** - In-depth algorithm documentation
- **[Testing Guide](tests/README.md)** - Test suite documentation and best practices
- Musical theory-based instrument complementarity
- Skill level tolerance with experience weighting

### Audio Samples

- UploadThing integration for reliable CDN delivery
- Automatic duration extraction from audio files
- Genre tagging and instrument categorization
- Public/private visibility controls

### User Experience

- Progressive profile setup wizard
- Real-time audio player with modern controls
- Responsive design for mobile and desktop
- Dark/light theme support

## 📚 Documentation

- **Algorithm**: `src/lib/matching/README.md`
- **Database**: `docs/DATABASE_SCHEMA.md`
- **Testing**: `tests/README.md`
- **API**: `src/server/DOCS_QUERIES.md` & `src/server/DOCS_MUTATIONS.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:matching:all`
5. Submit a pull request

## 📄 License

[MIT License](LICENSE)

---

**Status**: 🚀 Production Ready  
**Algorithm**: ⚡ Real-time Capable  
**Tests**: 🧪 Comprehensive Coverage  
**Documentation**: 📚 Complete

_Built with ❤️ for the music community_
