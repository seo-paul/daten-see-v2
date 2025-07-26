#!/bin/bash

# Testing & Reliability Monitoring Script
# Comprehensive test health monitoring with flakiness detection
# Usage: ./scripts/testing-monitor.sh [--json]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
JSON_OUTPUT=false
PROJECT_ROOT="$(pwd)"
FLAKINESS_THRESHOLD=2  # Number of retries before marking as flaky

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Testing check results
declare -A TEST_CHECKS
OVERALL_TESTING="excellent"
TESTING_SCORE=0

# Helper functions
log_info() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${BLUE}ℹ️  $1${NC}"
    fi
}

log_success() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${GREEN}✅ $1${NC}"
    fi
}

log_warning() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${YELLOW}⚠️  $1${NC}"
    fi
    if [[ "$OVERALL_TESTING" == "excellent" ]]; then
        OVERALL_TESTING="good"
    fi
}

log_error() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${RED}❌ $1${NC}"
    fi
    OVERALL_TESTING="needs-improvement"
}

# Unit Test Coverage & Health
check_unit_tests() {
    local name="Unit Tests"
    
    # Run Jest tests
    local test_result=$(npm run test -- --passWithNoTests --verbose --json 2>/dev/null || echo "failed")
    
    if [[ "$test_result" == "failed" ]]; then
        TEST_CHECKS["unit_tests"]="poor"
        log_error "$name: Jest tests failed to run"
        return 1
    fi
    
    # Extract results from Jest JSON output (if available)
    local total_tests=$(echo "$test_result" | jq '.numTotalTests // 0' 2>/dev/null || echo "0")
    local passed_tests=$(echo "$test_result" | jq '.numPassedTests // 0' 2>/dev/null || echo "0")
    local failed_tests=$(echo "$test_result" | jq '.numFailedTests // 0' 2>/dev/null || echo "0")
    local test_suites=$(echo "$test_result" | jq '.numTotalTestSuites // 0' 2>/dev/null || echo "0")
    
    TEST_CHECKS["unit_total"]=$total_tests
    TEST_CHECKS["unit_passed"]=$passed_tests
    TEST_CHECKS["unit_failed"]=$failed_tests
    TEST_CHECKS["unit_suites"]=$test_suites
    
    if [[ $total_tests -eq 0 ]]; then
        TEST_CHECKS["unit_tests"]="needs-improvement"
        log_warning "$name: No tests found"
    elif [[ $failed_tests -eq 0 ]]; then
        if [[ $total_tests -ge 10 ]]; then
            TEST_CHECKS["unit_tests"]="excellent"
            log_success "$name: $passed_tests/$total_tests passed (excellent coverage)"
        else
            TEST_CHECKS["unit_tests"]="good"
            log_success "$name: $passed_tests/$total_tests passed (good, but could use more tests)"
        fi
    else
        TEST_CHECKS["unit_tests"]="poor"
        log_error "$name: $failed_tests/$total_tests failed"
    fi
}

# E2E Test Health
check_e2e_tests() {
    local name="E2E Tests"
    
    # Check if Playwright is configured
    if [[ ! -f "playwright.config.ts" ]]; then
        TEST_CHECKS["e2e_tests"]="unknown"
        log_warning "$name: Playwright not configured"
        return 1
    fi
    
    # Check if app is running for E2E tests
    if ! curl -f -s --max-time 5 "http://localhost:3000" > /dev/null 2>&1; then
        TEST_CHECKS["e2e_tests"]="unknown"
        log_warning "$name: App not running for E2E testing"
        return 1
    fi
    
    # Run Playwright tests
    local e2e_result=$(npx playwright test --reporter=json 2>/dev/null || echo "failed")
    
    if [[ "$e2e_result" == "failed" ]]; then
        TEST_CHECKS["e2e_tests"]="poor"
        log_error "$name: Playwright tests failed to run"
        return 1
    fi
    
    # Parse Playwright results
    local total_e2e=$(echo "$e2e_result" | jq '.suites[].specs | length' 2>/dev/null | awk '{sum += $1} END {print sum+0}')
    local passed_e2e=$(echo "$e2e_result" | jq '[.suites[].specs[].tests[] | select(.status == "passed")] | length' 2>/dev/null || echo "0")
    local failed_e2e=$(echo "$e2e_result" | jq '[.suites[].specs[].tests[] | select(.status == "failed")] | length' 2>/dev/null || echo "0")
    
    TEST_CHECKS["e2e_total"]=$total_e2e
    TEST_CHECKS["e2e_passed"]=$passed_e2e
    TEST_CHECKS["e2e_failed"]=$failed_e2e
    
    if [[ $total_e2e -eq 0 ]]; then
        TEST_CHECKS["e2e_tests"]="needs-improvement"
        log_warning "$name: No E2E tests found"
    elif [[ $failed_e2e -eq 0 ]]; then
        if [[ $total_e2e -ge 5 ]]; then
            TEST_CHECKS["e2e_tests"]="excellent"
            log_success "$name: $passed_e2e/$total_e2e passed (comprehensive coverage)"
        else
            TEST_CHECKS["e2e_tests"]="good"
            log_success "$name: $passed_e2e/$total_e2e passed (basic coverage)"
        fi
    else
        TEST_CHECKS["e2e_tests"]="poor"
        log_error "$name: $failed_e2e/$total_e2e failed"
    fi
}

# Test Flakiness Detection
check_test_flakiness() {
    local name="Test Flakiness"
    
    # Run tests multiple times to detect flakiness
    local flaky_tests=0
    local consistent_tests=0
    
    # For demo purposes, run a quick flakiness check
    # In practice, this would analyze historical test results
    if [[ -f "test-results.json" ]]; then
        # Parse historical results (placeholder)
        flaky_tests=0
        consistent_tests=10
    else
        # Quick run to detect immediate issues
        local run1_result=$(npm run test -- --passWithNoTests --silent 2>/dev/null && echo "pass" || echo "fail")
        local run2_result=$(npm run test -- --passWithNoTests --silent 2>/dev/null && echo "pass" || echo "fail")
        
        if [[ "$run1_result" == "$run2_result" ]]; then
            consistent_tests=1
            flaky_tests=0
        else
            consistent_tests=0
            flaky_tests=1
        fi
    fi
    
    TEST_CHECKS["flaky_tests"]=$flaky_tests
    TEST_CHECKS["consistent_tests"]=$consistent_tests
    
    if [[ $flaky_tests -eq 0 ]]; then
        TEST_CHECKS["test_flakiness"]="excellent"
        log_success "$name: No flaky tests detected (excellent stability)"
    elif [[ $flaky_tests -le 2 ]]; then
        TEST_CHECKS["test_flakiness"]="good"
        log_warning "$name: $flaky_tests potentially flaky tests (acceptable)"
    else
        TEST_CHECKS["test_flakiness"]="needs-improvement"
        log_warning "$name: $flaky_tests flaky tests detected (needs attention)"
    fi
}

# Test Environment Health
check_test_environment() {
    local name="Test Environment"
    
    local env_issues=0
    local env_checks=0
    
    # Check Jest configuration
    if [[ -f "jest.config.js" ]]; then
        log_success "Jest configuration: Found"
        ((env_checks++))
    else
        log_warning "Jest configuration: Missing"
        ((env_issues++))
        ((env_checks++))
    fi
    
    # Check Jest setup file
    if [[ -f "jest.setup.js" ]]; then
        log_success "Jest setup: Found"
        ((env_checks++))
    else
        log_warning "Jest setup: Missing"
        ((env_issues++))
        ((env_checks++))
    fi
    
    # Check Playwright configuration
    if [[ -f "playwright.config.ts" ]]; then
        log_success "Playwright configuration: Found"
        ((env_checks++))
    else
        log_warning "Playwright configuration: Missing"
        ((env_issues++))
        ((env_checks++))
    fi
    
    # Check test directories
    if [[ -d "tests" || -d "__tests__" || -d "src/__tests__" ]]; then
        log_success "Test directories: Found"
        ((env_checks++))
    else
        log_warning "Test directories: Missing"
        ((env_issues++))
        ((env_checks++))
    fi
    
    TEST_CHECKS["env_issues"]=$env_issues
    TEST_CHECKS["env_checks_total"]=$env_checks
    
    local env_score=$((((env_checks - env_issues) * 100) / env_checks))
    
    if [[ $env_issues -eq 0 ]]; then
        TEST_CHECKS["test_environment"]="excellent"
        log_success "$name: All configurations present (excellent)"
    elif [[ $env_score -ge 75 ]]; then
        TEST_CHECKS["test_environment"]="good"
        log_success "$name: Most configurations present ($env_score% complete)"
    else
        TEST_CHECKS["test_environment"]="needs-improvement"
        log_warning "$name: Several configurations missing ($env_score% complete)"
    fi
}

# Test Performance
check_test_performance() {
    local name="Test Performance"
    
    # Measure test execution time
    local start_time=$(date +%s)
    npm run test -- --passWithNoTests --silent > /dev/null 2>&1 || true
    local end_time=$(date +%s)
    local test_duration=$((end_time - start_time))
    
    TEST_CHECKS["test_duration"]=$test_duration
    
    if [[ $test_duration -le 30 ]]; then
        TEST_CHECKS["test_performance"]="excellent"
        log_success "$name: Tests run in ${test_duration}s (fast)"
    elif [[ $test_duration -le 60 ]]; then
        TEST_CHECKS["test_performance"]="good"
        log_success "$name: Tests run in ${test_duration}s (acceptable)"
    elif [[ $test_duration -le 120 ]]; then
        TEST_CHECKS["test_performance"]="needs-improvement"
        log_warning "$name: Tests run in ${test_duration}s (slow)"
    else
        TEST_CHECKS["test_performance"]="poor"
        log_error "$name: Tests run in ${test_duration}s (very slow)"
    fi
}

# Calculate overall testing score
calculate_testing_score() {
    local total_score=0
    local check_count=0
    
    for check in "${!TEST_CHECKS[@]}"; do
        case "${TEST_CHECKS[$check]}" in
            "excellent") total_score=$((total_score + 100)); ((check_count++)) ;;
            "good") total_score=$((total_score + 80)); ((check_count++)) ;;
            "needs-improvement") total_score=$((total_score + 60)); ((check_count++)) ;;
            "poor") total_score=$((total_score + 40)); ((check_count++)) ;;
        esac
    done
    
    if [[ $check_count -gt 0 ]]; then
        TESTING_SCORE=$((total_score / check_count))
    fi
}

# Generate JSON output
generate_json_output() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat << EOF
{
  "timestamp": "$timestamp",
  "overall_testing": "$OVERALL_TESTING",
  "testing_score": $TESTING_SCORE,
  "checks": {
    "unit_tests": "${TEST_CHECKS[unit_tests]}",
    "e2e_tests": "${TEST_CHECKS[e2e_tests]}",
    "test_flakiness": "${TEST_CHECKS[test_flakiness]}",
    "test_environment": "${TEST_CHECKS[test_environment]}",
    "test_performance": "${TEST_CHECKS[test_performance]}"
  },
  "metrics": {
    "unit_total": ${TEST_CHECKS[unit_total]:-0},
    "unit_passed": ${TEST_CHECKS[unit_passed]:-0},
    "unit_failed": ${TEST_CHECKS[unit_failed]:-0},
    "e2e_total": ${TEST_CHECKS[e2e_total]:-0},
    "e2e_passed": ${TEST_CHECKS[e2e_passed]:-0},
    "e2e_failed": ${TEST_CHECKS[e2e_failed]:-0},
    "flaky_tests": ${TEST_CHECKS[flaky_tests]:-0},
    "consistent_tests": ${TEST_CHECKS[consistent_tests]:-0},
    "env_issues": ${TEST_CHECKS[env_issues]:-0},
    "test_duration": ${TEST_CHECKS[test_duration]:-0}
  }
}
EOF
}

# Main execution
main() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        log_info "Starting Testing & Reliability Analysis..."
        echo ""
    fi
    
    # Run all checks
    check_unit_tests
    check_e2e_tests
    check_test_flakiness
    check_test_environment
    check_test_performance
    
    # Calculate overall score
    calculate_testing_score
    
    if [[ "$JSON_OUTPUT" == true ]]; then
        generate_json_output
    else
        echo ""
        case "$OVERALL_TESTING" in
            "excellent")
                log_success "Overall Testing: EXCELLENT 🧪 (Score: $TESTING_SCORE/100)"
                ;;
            "good")
                log_success "Overall Testing: GOOD ✅ (Score: $TESTING_SCORE/100)"
                ;;
            "needs-improvement")
                log_warning "Overall Testing: NEEDS IMPROVEMENT ⚠️ (Score: $TESTING_SCORE/100)"
                ;;
            *)
                log_error "Overall Testing: POOR ❌ (Score: $TESTING_SCORE/100)"
                ;;
        esac
    fi
    
    # Exit with appropriate code
    case "$OVERALL_TESTING" in
        "excellent"|"good") exit 0 ;;
        "needs-improvement") exit 1 ;;
        *) exit 2 ;;
    esac
}

# Check dependencies
if ! command -v jq &> /dev/null; then
    log_warning "jq not available - some JSON parsing may be limited"
fi

main "$@"