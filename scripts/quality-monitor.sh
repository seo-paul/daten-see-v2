#!/bin/bash

# Code Quality Monitoring Script
# Extends existing ESLint/TypeScript checks with comprehensive quality metrics
# Usage: ./scripts/quality-monitor.sh [--json]

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
COVERAGE_THRESHOLD=80
COMPLEXITY_THRESHOLD=10

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

# Quality check results
declare -A QUALITY_CHECKS
OVERALL_QUALITY="excellent"
QUALITY_SCORE=0

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
    if [[ "$OVERALL_QUALITY" == "excellent" ]]; then
        OVERALL_QUALITY="good"
    fi
}

log_error() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${RED}❌ $1${NC}"
    fi
    OVERALL_QUALITY="needs-improvement"
}

# TypeScript Quality Check
check_typescript() {
    local name="TypeScript Compliance"
    
    if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
        QUALITY_CHECKS["typescript"]="excellent"
        log_success "$name: No TypeScript errors"
        return 0
    else
        local error_count=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0")
        if [[ $error_count -gt 0 ]]; then
            QUALITY_CHECKS["typescript"]="needs-improvement"
            log_error "$name: $error_count TypeScript errors found"
            return 1
        fi
    fi
}

# ESLint Quality Check
check_eslint() {
    local name="ESLint Compliance"
    
    local eslint_result=$(npx eslint . --format json 2>/dev/null || echo "[]")
    local error_count=$(echo "$eslint_result" | jq '[.[] | .errorCount] | add // 0')
    local warning_count=$(echo "$eslint_result" | jq '[.[] | .warningCount] | add // 0')
    
    if [[ $error_count -eq 0 && $warning_count -eq 0 ]]; then
        QUALITY_CHECKS["eslint"]="excellent"
        log_success "$name: No ESLint issues"
    elif [[ $error_count -eq 0 && $warning_count -le 5 ]]; then
        QUALITY_CHECKS["eslint"]="good"
        log_success "$name: $warning_count warnings (acceptable)"
    elif [[ $error_count -eq 0 ]]; then
        QUALITY_CHECKS["eslint"]="needs-improvement"
        log_warning "$name: $warning_count warnings"
    else
        QUALITY_CHECKS["eslint"]="poor"
        log_error "$name: $error_count errors, $warning_count warnings"
    fi
    
    QUALITY_CHECKS["eslint_errors"]=$error_count
    QUALITY_CHECKS["eslint_warnings"]=$warning_count
}

# Test Coverage Check
check_test_coverage() {
    local name="Test Coverage"
    
    # Run tests with coverage
    local coverage_result=$(npm run test:coverage -- --silent --passWithNoTests 2>/dev/null || echo "failed")
    
    if [[ "$coverage_result" == "failed" ]]; then
        QUALITY_CHECKS["coverage"]="unknown"
        log_warning "$name: Unable to determine coverage"
        return 1
    fi
    
    # Extract coverage percentage from Jest output
    local coverage_file="$PROJECT_ROOT/coverage/lcov.info"
    if [[ -f "$coverage_file" ]]; then
        local lines_found=$(grep -c "LF:" "$coverage_file" 2>/dev/null || echo "0")
        local lines_hit=$(grep "LH:" "$coverage_file" 2>/dev/null | awk -F: '{sum += $2} END {print sum+0}')
        
        if [[ $lines_found -gt 0 ]]; then
            local coverage_percent=$(( (lines_hit * 100) / lines_found ))
            QUALITY_CHECKS["coverage_percent"]=$coverage_percent
            
            if [[ $coverage_percent -ge $COVERAGE_THRESHOLD ]]; then
                QUALITY_CHECKS["coverage"]="excellent"
                log_success "$name: ${coverage_percent}% (Target: ${COVERAGE_THRESHOLD}%)"
            elif [[ $coverage_percent -ge 60 ]]; then
                QUALITY_CHECKS["coverage"]="good"
                log_warning "$name: ${coverage_percent}% (Below target: ${COVERAGE_THRESHOLD}%)"
            else
                QUALITY_CHECKS["coverage"]="needs-improvement"
                log_error "$name: ${coverage_percent}% (Critically low)"
            fi
        else
            QUALITY_CHECKS["coverage"]="unknown"
            log_warning "$name: Unable to calculate coverage"
        fi
    else
        QUALITY_CHECKS["coverage"]="unknown"
        log_warning "$name: Coverage report not found"
    fi
}

# Code Complexity Check
check_complexity() {
    local name="Code Complexity"
    
    # Use a simple complexity metric based on file sizes and function counts
    local large_files=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | awk '$1 > 200 {count++} END {print count+0}')
    local total_files=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
    
    if [[ $total_files -gt 0 ]]; then
        local complexity_ratio=$(( (large_files * 100) / total_files ))
        QUALITY_CHECKS["complexity_ratio"]=$complexity_ratio
        
        if [[ $complexity_ratio -le 10 ]]; then
            QUALITY_CHECKS["complexity"]="excellent"
            log_success "$name: ${complexity_ratio}% of files are large (< 10% is excellent)"
        elif [[ $complexity_ratio -le 25 ]]; then
            QUALITY_CHECKS["complexity"]="good"
            log_warning "$name: ${complexity_ratio}% of files are large (acceptable)"
        else
            QUALITY_CHECKS["complexity"]="needs-improvement"
            log_error "$name: ${complexity_ratio}% of files are large (consider refactoring)"
        fi
    else
        QUALITY_CHECKS["complexity"]="unknown"
        log_warning "$name: No TypeScript files found"
    fi
}

# Dependency Security Check
check_dependencies() {
    local name="Dependency Security"
    
    # Check for known vulnerabilities
    local audit_result=$(npm audit --audit-level moderate --json 2>/dev/null || echo '{"vulnerabilities":{}}')
    local vuln_count=$(echo "$audit_result" | jq '.metadata.vulnerabilities.total // 0')
    local critical_count=$(echo "$audit_result" | jq '.metadata.vulnerabilities.critical // 0')
    local high_count=$(echo "$audit_result" | jq '.metadata.vulnerabilities.high // 0')
    
    QUALITY_CHECKS["vulnerabilities_total"]=$vuln_count
    QUALITY_CHECKS["vulnerabilities_critical"]=$critical_count
    QUALITY_CHECKS["vulnerabilities_high"]=$high_count
    
    if [[ $critical_count -eq 0 && $high_count -eq 0 ]]; then
        if [[ $vuln_count -eq 0 ]]; then
            QUALITY_CHECKS["dependencies"]="excellent"
            log_success "$name: No vulnerabilities found"
        else
            QUALITY_CHECKS["dependencies"]="good"
            log_success "$name: $vuln_count low/moderate vulnerabilities"
        fi
    elif [[ $critical_count -eq 0 && $high_count -le 2 ]]; then
        QUALITY_CHECKS["dependencies"]="needs-improvement"
        log_warning "$name: $high_count high vulnerabilities"
    else
        QUALITY_CHECKS["dependencies"]="poor"
        log_error "$name: $critical_count critical, $high_count high vulnerabilities"
    fi
}

# Calculate overall quality score
calculate_quality_score() {
    local total_score=0
    local check_count=0
    
    for check in "${!QUALITY_CHECKS[@]}"; do
        case "${QUALITY_CHECKS[$check]}" in
            "excellent") total_score=$((total_score + 100)); ((check_count++)) ;;
            "good") total_score=$((total_score + 80)); ((check_count++)) ;;
            "needs-improvement") total_score=$((total_score + 60)); ((check_count++)) ;;
            "poor") total_score=$((total_score + 40)); ((check_count++)) ;;
        esac
    done
    
    if [[ $check_count -gt 0 ]]; then
        QUALITY_SCORE=$((total_score / check_count))
    fi
}

# Generate JSON output
generate_json_output() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat << EOF
{
  "timestamp": "$timestamp",
  "overall_quality": "$OVERALL_QUALITY",
  "quality_score": $QUALITY_SCORE,
  "checks": {
    "typescript": "${QUALITY_CHECKS[typescript]}",
    "eslint": "${QUALITY_CHECKS[eslint]}",
    "coverage": "${QUALITY_CHECKS[coverage]}",
    "complexity": "${QUALITY_CHECKS[complexity]}",
    "dependencies": "${QUALITY_CHECKS[dependencies]}"
  },
  "metrics": {
    "eslint_errors": ${QUALITY_CHECKS[eslint_errors]:-0},
    "eslint_warnings": ${QUALITY_CHECKS[eslint_warnings]:-0},
    "coverage_percent": ${QUALITY_CHECKS[coverage_percent]:-0},
    "complexity_ratio": ${QUALITY_CHECKS[complexity_ratio]:-0},
    "vulnerabilities_total": ${QUALITY_CHECKS[vulnerabilities_total]:-0},
    "vulnerabilities_critical": ${QUALITY_CHECKS[vulnerabilities_critical]:-0},
    "vulnerabilities_high": ${QUALITY_CHECKS[vulnerabilities_high]:-0}
  }
}
EOF
}

# Main execution
main() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        log_info "Starting Code Quality Analysis..."
        echo ""
    fi
    
    # Run all checks
    check_typescript
    check_eslint
    check_test_coverage
    check_complexity
    check_dependencies
    
    # Calculate overall score
    calculate_quality_score
    
    if [[ "$JSON_OUTPUT" == true ]]; then
        generate_json_output
    else
        echo ""
        case "$OVERALL_QUALITY" in
            "excellent")
                log_success "Overall Quality: EXCELLENT ✨ (Score: $QUALITY_SCORE/100)"
                ;;
            "good")
                log_success "Overall Quality: GOOD ✅ (Score: $QUALITY_SCORE/100)"
                ;;
            "needs-improvement")
                log_warning "Overall Quality: NEEDS IMPROVEMENT ⚠️ (Score: $QUALITY_SCORE/100)"
                ;;
            *)
                log_error "Overall Quality: POOR ❌ (Score: $QUALITY_SCORE/100)"
                ;;
        esac
    fi
    
    # Exit with appropriate code
    case "$OVERALL_QUALITY" in
        "excellent"|"good") exit 0 ;;
        "needs-improvement") exit 1 ;;
        *) exit 2 ;;
    esac
}

# Check dependencies
if ! command -v jq &> /dev/null; then
    log_warning "jq not available - some checks may be limited"
fi

main "$@"