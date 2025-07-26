#!/bin/bash

# Security & Accessibility Monitoring Script
# GDPR compliance + WCAG 2.1 AA + Security vulnerability scanning
# Usage: ./scripts/security-accessibility-monitor.sh [--json]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
JSON_OUTPUT=false
APP_URL="http://localhost:3000"
PROJECT_ROOT="$(pwd)"

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

# Security & Accessibility check results
declare -A SECURITY_CHECKS
OVERALL_SECURITY="excellent"
SECURITY_SCORE=0

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
    if [[ "$OVERALL_SECURITY" == "excellent" ]]; then
        OVERALL_SECURITY="good"
    fi
}

log_error() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${RED}❌ $1${NC}"
    fi
    OVERALL_SECURITY="needs-improvement"
}

# GDPR Compliance Check
check_gdpr_compliance() {
    local name="GDPR Compliance"
    
    local gdpr_issues=0
    local gdpr_checks=0
    
    # Check for cookie consent implementation
    if grep -r "cookie.*consent\|consent.*cookie" src/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
        log_success "Cookie consent: Implementation found"
        ((gdpr_checks++))
    else
        log_warning "Cookie consent: No implementation found"
        ((gdpr_issues++))
        ((gdpr_checks++))
    fi
    
    # Check for privacy policy references
    if grep -r "privacy.*policy\|datenschutz" src/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
        log_success "Privacy policy: References found"
        ((gdpr_checks++))
    else
        log_warning "Privacy policy: No references found"
        ((gdpr_issues++))
        ((gdpr_checks++))
    fi
    
    # Check for data export/deletion functionality
    if grep -r "export.*data\|delete.*data\|data.*export\|data.*delete" src/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
        log_success "Data portability: Export/delete functions found"
        ((gdpr_checks++))
    else
        log_warning "Data portability: No export/delete functions found"
        ((gdpr_issues++))
        ((gdpr_checks++))
    fi
    
    # Check for opt-in/opt-out mechanisms
    if grep -r "opt.*in\|opt.*out\|consent" src/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
        log_success "Consent management: Opt-in/out mechanisms found"
        ((gdpr_checks++))
    else
        log_warning "Consent management: No opt-in/out mechanisms found"
        ((gdpr_issues++))
        ((gdpr_checks++))
    fi
    
    # Check for data minimization patterns
    if grep -r "data.*minimal\|minimal.*data\|necessary.*data" src/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
        log_success "Data minimization: Patterns found"
        ((gdpr_checks++))
    else
        log_warning "Data minimization: No patterns found"
        ((gdpr_issues++))
        ((gdpr_checks++))
    fi
    
    SECURITY_CHECKS["gdpr_issues"]=$gdpr_issues
    SECURITY_CHECKS["gdpr_checks_total"]=$gdpr_checks
    
    local gdpr_score=$((((gdpr_checks - gdpr_issues) * 100) / gdpr_checks))
    
    if [[ $gdpr_issues -eq 0 ]]; then
        SECURITY_CHECKS["gdpr_compliance"]="excellent"
        log_success "$name: All GDPR requirements met (excellent)"
    elif [[ $gdpr_score -ge 80 ]]; then
        SECURITY_CHECKS["gdpr_compliance"]="good"
        log_success "$name: Most GDPR requirements met ($gdpr_score% complete)"
    elif [[ $gdpr_score -ge 60 ]]; then
        SECURITY_CHECKS["gdpr_compliance"]="needs-improvement"
        log_warning "$name: Some GDPR requirements missing ($gdpr_score% complete)"
    else
        SECURITY_CHECKS["gdpr_compliance"]="poor"
        log_error "$name: Many GDPR requirements missing ($gdpr_score% complete)"
    fi
}

# Accessibility Check (WCAG 2.1 AA)
check_accessibility() {
    local name="Accessibility (WCAG 2.1 AA)"
    
    local a11y_issues=0
    local a11y_checks=0
    
    # Check for alt attributes on images
    local img_without_alt=$(grep -r "<img" src/ --include="*.tsx" | grep -v "alt=" | wc -l | tr -d ' ')
    local total_images=$(grep -r "<img" src/ --include="*.tsx" | wc -l | tr -d ' ')
    
    if [[ $total_images -gt 0 ]]; then
        if [[ $img_without_alt -eq 0 ]]; then
            log_success "Image alt attributes: All images have alt text"
            ((a11y_checks++))
        else
            log_warning "Image alt attributes: $img_without_alt/$total_images images missing alt text"
            ((a11y_issues++))
            ((a11y_checks++))
        fi
    else
        log_success "Image alt attributes: No images found"
        ((a11y_checks++))
    fi
    
    # Check for ARIA labels and roles
    if grep -r "aria-label\|aria-describedby\|role=" src/ --include="*.tsx" > /dev/null 2>&1; then
        log_success "ARIA attributes: ARIA labels/roles found"
        ((a11y_checks++))
    else
        log_warning "ARIA attributes: No ARIA labels/roles found"
        ((a11y_issues++))
        ((a11y_checks++))
    fi
    
    # Check for semantic HTML elements
    if grep -r "<main\|<header\|<nav\|<section\|<article" src/ --include="*.tsx" > /dev/null 2>&1; then
        log_success "Semantic HTML: Semantic elements found"
        ((a11y_checks++))
    else
        log_warning "Semantic HTML: No semantic elements found"
        ((a11y_issues++))
        ((a11y_checks++))
    fi
    
    # Check for keyboard navigation support
    if grep -r "onKeyDown\|onKeyPress\|tabIndex" src/ --include="*.tsx" > /dev/null 2>&1; then
        log_success "Keyboard navigation: Keyboard handlers found"
        ((a11y_checks++))
    else
        log_warning "Keyboard navigation: No keyboard handlers found"
        ((a11y_issues++))
        ((a11y_checks++))
    fi
    
    # Check for focus management
    if grep -r "focus\|Focus" src/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
        log_success "Focus management: Focus handling found"
        ((a11y_checks++))
    else
        log_warning "Focus management: No focus handling found"
        ((a11y_issues++))
        ((a11y_checks++))
    fi
    
    SECURITY_CHECKS["a11y_issues"]=$a11y_issues
    SECURITY_CHECKS["a11y_checks_total"]=$a11y_checks
    SECURITY_CHECKS["images_without_alt"]=$img_without_alt
    SECURITY_CHECKS["total_images"]=$total_images
    
    local a11y_score=$((((a11y_checks - a11y_issues) * 100) / a11y_checks))
    
    if [[ $a11y_issues -eq 0 ]]; then
        SECURITY_CHECKS["accessibility"]="excellent"
        log_success "$name: All accessibility requirements met (excellent)"
    elif [[ $a11y_score -ge 80 ]]; then
        SECURITY_CHECKS["accessibility"]="good"
        log_success "$name: Most accessibility requirements met ($a11y_score% complete)"
    elif [[ $a11y_score -ge 60 ]]; then
        SECURITY_CHECKS["accessibility"]="needs-improvement"
        log_warning "$name: Some accessibility requirements missing ($a11y_score% complete)"
    else
        SECURITY_CHECKS["accessibility"]="poor"
        log_error "$name: Many accessibility requirements missing ($a11y_score% complete)"
    fi
}

# Security Vulnerability Scan
check_security_vulnerabilities() {
    local name="Security Vulnerabilities"
    
    # NPM Audit for known vulnerabilities
    local audit_result=$(npm audit --audit-level moderate --json 2>/dev/null || echo '{"vulnerabilities":{}}')
    local total_vulns=$(echo "$audit_result" | jq '.metadata.vulnerabilities.total // 0')
    local critical_vulns=$(echo "$audit_result" | jq '.metadata.vulnerabilities.critical // 0')
    local high_vulns=$(echo "$audit_result" | jq '.metadata.vulnerabilities.high // 0')
    local moderate_vulns=$(echo "$audit_result" | jq '.metadata.vulnerabilities.moderate // 0')
    
    SECURITY_CHECKS["total_vulnerabilities"]=$total_vulns
    SECURITY_CHECKS["critical_vulnerabilities"]=$critical_vulns
    SECURITY_CHECKS["high_vulnerabilities"]=$high_vulns
    SECURITY_CHECKS["moderate_vulnerabilities"]=$moderate_vulns
    
    if [[ $critical_vulns -eq 0 && $high_vulns -eq 0 ]]; then
        if [[ $total_vulns -eq 0 ]]; then
            SECURITY_CHECKS["security_vulnerabilities"]="excellent"
            log_success "$name: No vulnerabilities found (excellent)"
        else
            SECURITY_CHECKS["security_vulnerabilities"]="good"
            log_success "$name: Only $moderate_vulns moderate/low vulnerabilities (acceptable)"
        fi
    elif [[ $critical_vulns -eq 0 && $high_vulns -le 2 ]]; then
        SECURITY_CHECKS["security_vulnerabilities"]="needs-improvement"
        log_warning "$name: $high_vulns high vulnerabilities found"
    else
        SECURITY_CHECKS["security_vulnerabilities"]="poor"
        log_error "$name: $critical_vulns critical, $high_vulns high vulnerabilities found"
    fi
}

# Content Security Policy Check
check_content_security_policy() {
    local name="Content Security Policy"
    
    # Check for CSP configuration in Next.js config
    if grep -r "contentSecurityPolicy\|Content-Security-Policy" next.config.js src/ --include="*.ts" --include="*.js" > /dev/null 2>&1; then
        SECURITY_CHECKS["content_security_policy"]="excellent"
        log_success "$name: CSP configuration found"
    else
        # Check if app is running to test CSP headers
        if curl -f -s --max-time 5 "$APP_URL" > /dev/null 2>&1; then
            local csp_header=$(curl -s -I "$APP_URL" | grep -i "content-security-policy" || echo "")
            if [[ -n "$csp_header" ]]; then
                SECURITY_CHECKS["content_security_policy"]="good"
                log_success "$name: CSP headers detected at runtime"
            else
                SECURITY_CHECKS["content_security_policy"]="needs-improvement"
                log_warning "$name: No CSP headers found"
            fi
        else
            SECURITY_CHECKS["content_security_policy"]="unknown"
            log_warning "$name: Cannot check CSP (app not running)"
        fi
    fi
}

# Secure Coding Patterns Check
check_secure_coding() {
    local name="Secure Coding Patterns"
    
    local security_issues=0
    local security_checks=0
    
    # Check for SQL injection protection (if database code exists)
    if find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "query\|Query" > /dev/null 2>&1; then
        if grep -r "prepared.*statement\|parameterized\|sanitize" src/ --include="*.ts" > /dev/null 2>&1; then
            log_success "SQL injection protection: Parameterized queries found"
            ((security_checks++))
        else
            log_warning "SQL injection protection: No parameterized queries found"
            ((security_issues++))
            ((security_checks++))
        fi
    else
        log_success "SQL injection: No database queries found"
        ((security_checks++))
    fi
    
    # Check for XSS protection
    if grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx" > /dev/null 2>&1; then
        log_warning "XSS risk: dangerouslySetInnerHTML usage found"
        ((security_issues++))
        ((security_checks++))
    else
        log_success "XSS protection: No dangerous HTML injection found"
        ((security_checks++))
    fi
    
    # Check for proper error handling (no sensitive data leakage)
    local error_logs=$(grep -r "console\.error\|console\.log" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
    if [[ $error_logs -gt 10 ]]; then
        log_warning "Information disclosure: Many console logs found ($error_logs)"
        ((security_issues++))
        ((security_checks++))
    else
        log_success "Information disclosure: Console logging appears controlled"
        ((security_checks++))
    fi
    
    # Check for hardcoded secrets
    if grep -r "password.*=\|api.*key.*=\|secret.*=" src/ --include="*.ts" --include="*.tsx" | grep -v "process\.env" > /dev/null 2>&1; then
        log_error "Hardcoded secrets: Potential secrets found in source code"
        ((security_issues++))
        ((security_checks++))
    else
        log_success "Secret management: No hardcoded secrets found"
        ((security_checks++))
    fi
    
    SECURITY_CHECKS["security_issues"]=$security_issues
    SECURITY_CHECKS["security_checks_total"]=$security_checks
    
    if [[ $security_issues -eq 0 ]]; then
        SECURITY_CHECKS["secure_coding"]="excellent"
        log_success "$name: All secure coding checks passed"
    elif [[ $security_issues -le 1 ]]; then
        SECURITY_CHECKS["secure_coding"]="good"
        log_success "$name: Minor security issues found ($security_issues issues)"
    else
        SECURITY_CHECKS["secure_coding"]="needs-improvement"
        log_warning "$name: Multiple security issues found ($security_issues issues)"
    fi
}

# Calculate overall security score
calculate_security_score() {
    local total_score=0
    local check_count=0
    
    for check in "${!SECURITY_CHECKS[@]}"; do
        case "${SECURITY_CHECKS[$check]}" in
            "excellent") total_score=$((total_score + 100)); ((check_count++)) ;;
            "good") total_score=$((total_score + 80)); ((check_count++)) ;;
            "needs-improvement") total_score=$((total_score + 60)); ((check_count++)) ;;
            "poor") total_score=$((total_score + 40)); ((check_count++)) ;;
        esac
    done
    
    if [[ $check_count -gt 0 ]]; then
        SECURITY_SCORE=$((total_score / check_count))
    fi
}

# Generate JSON output
generate_json_output() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat << EOF
{
  "timestamp": "$timestamp",
  "overall_security": "$OVERALL_SECURITY",
  "security_score": $SECURITY_SCORE,
  "checks": {
    "gdpr_compliance": "${SECURITY_CHECKS[gdpr_compliance]}",
    "accessibility": "${SECURITY_CHECKS[accessibility]}",
    "security_vulnerabilities": "${SECURITY_CHECKS[security_vulnerabilities]}",
    "content_security_policy": "${SECURITY_CHECKS[content_security_policy]}",
    "secure_coding": "${SECURITY_CHECKS[secure_coding]}"
  },
  "metrics": {
    "gdpr_issues": ${SECURITY_CHECKS[gdpr_issues]:-0},
    "gdpr_checks_total": ${SECURITY_CHECKS[gdpr_checks_total]:-0},
    "a11y_issues": ${SECURITY_CHECKS[a11y_issues]:-0},
    "a11y_checks_total": ${SECURITY_CHECKS[a11y_checks_total]:-0},
    "images_without_alt": ${SECURITY_CHECKS[images_without_alt]:-0},
    "total_images": ${SECURITY_CHECKS[total_images]:-0},
    "total_vulnerabilities": ${SECURITY_CHECKS[total_vulnerabilities]:-0},
    "critical_vulnerabilities": ${SECURITY_CHECKS[critical_vulnerabilities]:-0},
    "high_vulnerabilities": ${SECURITY_CHECKS[high_vulnerabilities]:-0},
    "moderate_vulnerabilities": ${SECURITY_CHECKS[moderate_vulnerabilities]:-0},
    "security_issues": ${SECURITY_CHECKS[security_issues]:-0},
    "security_checks_total": ${SECURITY_CHECKS[security_checks_total]:-0}
  }
}
EOF
}

# Main execution
main() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        log_info "Starting Security & Accessibility Analysis..."
        echo ""
    fi
    
    # Run all checks
    check_gdpr_compliance
    check_accessibility
    check_security_vulnerabilities
    check_content_security_policy
    check_secure_coding
    
    # Calculate overall score
    calculate_security_score
    
    if [[ "$JSON_OUTPUT" == true ]]; then
        generate_json_output
    else
        echo ""
        case "$OVERALL_SECURITY" in
            "excellent")
                log_success "Overall Security & Accessibility: EXCELLENT 🔒 (Score: $SECURITY_SCORE/100)"
                ;;
            "good")
                log_success "Overall Security & Accessibility: GOOD ✅ (Score: $SECURITY_SCORE/100)"
                ;;
            "needs-improvement")
                log_warning "Overall Security & Accessibility: NEEDS IMPROVEMENT ⚠️ (Score: $SECURITY_SCORE/100)"
                ;;
            *)
                log_error "Overall Security & Accessibility: POOR ❌ (Score: $SECURITY_SCORE/100)"
                ;;
        esac
        
        # Additional recommendations
        echo ""
        log_info "Recommendations:"
        if [[ ${SECURITY_CHECKS[gdpr_issues]:-0} -gt 0 ]]; then
            echo "  📋 Review GDPR compliance requirements in STANDARDS.md"
        fi
        if [[ ${SECURITY_CHECKS[a11y_issues]:-0} -gt 0 ]]; then
            echo "  ♿ Implement WCAG 2.1 AA accessibility guidelines"
        fi
        if [[ ${SECURITY_CHECKS[critical_vulnerabilities]:-0} -gt 0 ]]; then
            echo "  🚨 Address critical security vulnerabilities immediately"
        fi
        if [[ ${SECURITY_CHECKS[security_issues]:-0} -gt 0 ]]; then
            echo "  🔐 Review secure coding practices"
        fi
    fi
    
    # Exit with appropriate code
    case "$OVERALL_SECURITY" in
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