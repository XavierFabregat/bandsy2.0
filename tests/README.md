# Bandsy Tests

This directory contains all test files for the Bandsy application, organized by feature area.

## Directory Structure

```
tests/
└── matching/
    ├── test-algorithm.ts           # Core algorithm test suite with mock data
    ├── run-tests.ts               # Test execution script
    ├── performance-test.ts        # Performance benchmarking
    └── test-results-analysis.md   # Detailed test analysis
```

## Running Tests

### Quick Commands

```bash
# Run algorithm tests only
npm run test:matching

# Run performance tests only
npm run test:matching:perf

# Run all matching tests (algorithm + performance)
npm run test:matching:all
```

### Alternative Methods

```bash
# Using npx directly
npx tsx tests/matching/run-tests.ts
npx tsx tests/matching/performance-test.ts

# Using the shell script
./test-matching.sh
```

## Test Categories

### Algorithm Tests (`run-tests.ts`)

- **Rhythm Section Compatibility**: Tests instrument complementarity
- **Genre vs Distance Trade-offs**: Validates geographic vs musical alignment
- **Cross-Country Distance Impact**: Tests extreme distance penalties
- **Skill Level Differences**: Validates experience gap handling
- **Band Formation Matrix**: Tests group compatibility scenarios
- **Activity Score Influence**: Validates engagement factor weighting
- **Custom Collaboration Tests**: Additional edge case scenarios

### Performance Tests (`performance-test.ts`)

- **Scalability Testing**: 10, 50, 100, 500 user calculations
- **Real-time Discovery**: Simulates realistic user discovery pipeline
- **Memory Usage Analysis**: Projects memory requirements for scale
- **Benchmark Results**: Calculations per second metrics

## Test Data

### Mock User Profiles

Located in `test-algorithm.ts`, includes 6 diverse musician profiles:

1. **Rock Guitarist** (San Francisco) - Guitar + Vocals
2. **Rock Bassist** (Oakland) - Bass only
3. **Jazz Drummer** (San Francisco) - Drums + Keyboard
4. **Indie Keyboardist** (Los Angeles) - Keyboard + Vocals
5. **Classical Violinist** (New York) - Violin + Expert Keyboard
6. **Punk Guitarist** (London) - Expert Guitar + Vocals

### Mock Data Coverage

- **Geographic Diversity**: US West Coast, East Coast, International
- **Genre Variety**: Rock, Jazz, Classical, Indie, Electronic, Punk, etc.
- **Skill Levels**: Beginner (2.5) to Expert (4.5) averages
- **Activity Patterns**: Recent to 3-day-old last activity
- **Instrument Mix**: Rhythm section, harmonic, melodic instruments

## Expected Results

### Compatibility Score Ranges

- **80-100**: Excellent local matches with strong musical alignment
- **60-79**: Good matches with minor differences (genre/skill gaps)
- **40-59**: Moderate compatibility (distance or genre limitations)
- **0-39**: Poor matches (major incompatibilities)

### Performance Benchmarks

- **Speed**: 240,000+ calculations/second
- **Latency**: <1ms for 100 candidate processing
- **Memory**: ~755 bytes per user profile
- **Scalability**: Ready for 100,000+ user base

## Adding New Tests

### Algorithm Tests

1. Add new mock users to `mockUsers` array in `test-algorithm.ts`
2. Create test scenarios in `runMatchingTests()` function
3. Use `testUserPair()` helper for individual comparisons
4. Update expected results in analysis documentation

### Performance Tests

1. Modify test sizes in `performanceTest()` function
2. Add new benchmark scenarios
3. Update memory usage calculations
4. Document performance expectations

## Test Analysis

Detailed analysis of test results is available in:

- `test-results-analysis.md` - Comprehensive result breakdown
- Console output - Real-time test execution feedback
- Performance metrics - Speed and memory usage data

## Continuous Integration

These tests are designed to be run in CI/CD pipelines:

```bash
# CI command for all tests
npm run test:matching:all

# Individual test validation
npm run test:matching && npm run test:matching:perf
```

## Development Workflow

1. **Make Algorithm Changes**: Modify files in `src/lib/matching/`
2. **Run Tests**: Execute `npm run test:matching:all`
3. **Analyze Results**: Check console output and analysis files
4. **Update Tests**: Add new test cases as needed
5. **Document Changes**: Update analysis and expectations

---

_Last Updated: December 27, 2024_
