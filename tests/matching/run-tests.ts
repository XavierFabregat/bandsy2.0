#!/usr/bin/env tsx

import { runMatchingTests, testUserPair, mockUsers } from "./test-algorithm";

console.log("🚀 Starting Bandsy Matching Algorithm Tests...\n");

try {
  // Run all comprehensive tests
  runMatchingTests();

  // Run some additional custom tests
  console.log("\n\n🔬 Additional Custom Tests");
  console.log("=".repeat(60));

  // Test cross-country musician collaboration
  testUserPair(
    mockUsers[5]!, // London punk guitarist
    mockUsers[0]!, // SF rock guitarist
    "Cross-Continental Collaboration Test",
  );

  // Test classical vs electronic mismatch
  testUserPair(
    mockUsers[4]!, // NYC classical violinist
    mockUsers[3]!, // LA indie/electronic keyboardist
    "Classical vs Electronic Genre Gap",
  );

  console.log("\n\n✅ All tests completed successfully!");
} catch (error) {
  console.error("❌ Test execution failed:", error);
  process.exit(1);
}
