#!/bin/bash

echo "🎵 Bandsy Matching Algorithm Test Suite"
echo "======================================="

# Check if tsx is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js"
    exit 1
fi

# Function to run a test with error handling
run_test() {
    local test_name="$1"
    local test_file="$2"
    
    echo ""
    echo "🚀 Running $test_name..."
    echo "----------------------------------------"
    
    if npx tsx "$test_file"; then
        echo "✅ $test_name completed successfully"
    else
        echo "❌ $test_name failed"
        exit 1
    fi
}

# Run algorithm tests
run_test "Algorithm Tests" "tests/matching/run-tests.ts"

# Run performance tests
run_test "Performance Tests" "tests/matching/performance-test.ts"

echo ""
echo "🎉 All matching algorithm tests completed successfully!"
echo "📊 Check tests/matching/test-results-analysis.md for detailed analysis" 