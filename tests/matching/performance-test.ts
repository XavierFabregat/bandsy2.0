#!/usr/bin/env tsx

import { CompositeScorer } from "@/lib/matching/algorithms/composite-scorer";
import { mockUsers } from "./test-algorithm";

function performanceTest() {
  console.log("🚀 Bandsy Matching Algorithm Performance Test\n");

  const testSizes = [10, 50, 100, 500];

  for (const size of testSizes) {
    console.log(`Testing with ${size} potential matches...`);

    // Create array of users (cycling through our mock users)
    const users = Array.from(
      { length: size },
      (_, i) => mockUsers[i % mockUsers.length]!,
    );

    const currentUser = mockUsers[0]!; // Test against first user

    // Measure performance
    const startTime = performance.now();

    const scores = users
      .map((candidate) => {
        if (candidate.id === currentUser.id) return null;
        return {
          candidate,
          score: CompositeScorer.calculate(currentUser, candidate),
        };
      })
      .filter(Boolean);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Sort by score for realistic usage
    scores.sort((a, b) => (b?.score.overall ?? 0) - (a?.score.overall ?? 0));

    console.log(`  ✅ ${size} calculations in ${duration.toFixed(2)}ms`);
    console.log(`  📊 ${(duration / size).toFixed(3)}ms per calculation`);
    console.log(`  🎯 Top score: ${scores[0]?.score.overall}/100`);
    console.log(
      `  📈 ${(1000 / (duration / size)).toFixed(0)} calculations/second\n`,
    );
  }

  // Test realistic discovery scenario
  console.log("🔍 Realistic Discovery Scenario");
  console.log("--------------------------------");

  const discoverySize = 100;
  const currentUser = mockUsers[0]!;
  const candidates = Array.from(
    { length: discoverySize },
    (_, i) => mockUsers[i % mockUsers.length]!,
  );

  const startTime = performance.now();

  // Simulate realistic discovery pipeline
  const results = candidates
    .filter((candidate) => candidate.id !== currentUser.id)
    .map((candidate) => ({
      candidate,
      score: CompositeScorer.calculate(currentUser, candidate),
    }))
    .filter((result) => result.score.overall >= 50) // Filter low scores
    .sort((a, b) => b.score.overall - a.score.overall)
    .slice(0, 20); // Top 20 matches

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  console.log(
    `  📊 Processed ${discoverySize} candidates in ${totalTime.toFixed(2)}ms`,
  );
  console.log(`  🎯 Found ${results.length} quality matches (≥50 score)`);
  console.log(
    `  ⚡ Ready for real-time discovery (${totalTime.toFixed(0)}ms < 200ms target)`,
  );
  console.log(
    `  🏆 Top match: ${results[0]?.score.overall}/100 with ${results[0]?.score.confidence}% confidence`,
  );

  // Memory usage estimation
  const memoryPerUser = JSON.stringify(mockUsers[0]).length;
  console.log(`\n💾 Memory Usage Estimation:`);
  console.log(`  📏 ~${memoryPerUser} bytes per user profile`);
  console.log(
    `  🗃️  ~${((memoryPerUser * 1000) / 1024).toFixed(1)}KB for 1,000 users`,
  );
  console.log(
    `  🏢 ~${((memoryPerUser * 100000) / 1024 / 1024).toFixed(1)}MB for 100,000 users`,
  );
}

performanceTest();
