#!/bin/bash

# Comprehensive Development Workflow Monitoring
# Integrates all monitoring agents with Docker-first workflow
# Usage: ./scripts/comprehensive-monitor.sh [--json] [--quick] [--full]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
JSON_OUTPUT=false
QUICK_MODE=false
FULL_MODE=false
PROJECT_ROOT="$(pwd)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --full)
            FULL_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--json] [--quick] [--full]"
            exit 1
            ;;
    esac
done

# Global results storage
declare -A COMPREHENSIVE_RESULTS
OVERALL_STATUS="excellent"
OVERALL_SCORE=0

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
    if [[ "$OVERALL_STATUS" == "excellent" ]]; then
        OVERALL_STATUS="good"
    fi
}

log_error() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${RED}❌ $1${NC}"
    fi
    OVERALL_STATUS="needs-improvement"
}

log_section() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo ""
        echo -e "${PURPLE}🔍 $1${NC}"
        echo "$(printf '=%.0s' {1..50})"
    fi
}

# Docker Workflow Integration Check
check_docker_integration() {
    local name="Docker Workflow Integration"
    log_section "$name"
    
    local docker_issues=0
    local docker_checks=0
    
    # Check if Docker is running
    if docker info > /dev/null 2>&1; then
        log_success "Docker daemon: Running"
        ((docker_checks++))
    else
        log_error "Docker daemon: Not running"
        ((docker_issues++))
        ((docker_checks++))
        return 1
    fi
    
    # Check docker-compose.yml exists
    if [[ -f "docker-compose.yml" ]]; then
        log_success "Docker Compose: Configuration found"
        ((docker_checks++))
    else
        log_warning "Docker Compose: Configuration missing"
        ((docker_issues++))
        ((docker_checks++))
    fi
    
    # Check quick-restart script
    if [[ -x "scripts/quick-restart.sh" ]]; then
        log_success "Quick restart script: Available and executable"
        ((docker_checks++))
    else
        log_warning "Quick restart script: Missing or not executable"
        ((docker_issues++))
        ((docker_checks++))
    fi

    # Check if app container is running
    if docker ps --format "table {{.Names}}" | grep -q "daten-see-app"; then
        log_success "App container: Running"
        ((docker_checks++))
    else
        log_warning "App container: Not running"
        ((docker_issues++))
        ((docker_checks++))
    fi
    
    COMPREHENSIVE_RESULTS["docker_issues"]=$docker_issues
    COMPREHENSIVE_RESULTS["docker_checks_total"]=$docker_checks
    
    if [[ $docker_issues -eq 0 ]]; then
        COMPREHENSIVE_RESULTS["docker_integration"]="excellent"
    elif [[ $docker_issues -le 1 ]]; then
        COMPREHENSIVE_RESULTS["docker_integration"]="good"
    else
        COMPREHENSIVE_RESULTS["docker_integration"]="needs-improvement"
    fi
}

# Run Individual Monitoring Agents
run_monitoring_agents() {
    local agents=(
        "quality-monitor.sh:Code Quality"
        "performance-monitor.sh:Performance"
        "testing-monitor.sh:Testing & Reliability"
        "security-accessibility-monitor.sh:Security & Accessibility"
        "api-health-check.sh:Infrastructure Health"
    )
    
    for agent_info in "${agents[@]}"; do
        local script_name=$(echo "$agent_info" | cut -d: -f1)
        local agent_name=$(echo "$agent_info" | cut -d: -f2)
        local script_path="scripts/$script_name"
        
        log_section "$agent_name Monitor"
        
        if [[ -x "$script_path" ]]; then
            local result_key=$(echo "$script_name" | sed 's/\.sh$//' | sed 's/-/_/g')
            
            if [[ "$QUICK_MODE" == true ]]; then
                # Quick mode: just check if script runs
                if timeout 30 "$script_path" --json > /dev/null 2>&1; then
                    COMPREHENSIVE_RESULTS["${result_key}_status"]="available"
                    log_success "$agent_name: Monitor available"
                else
                    COMPREHENSIVE_RESULTS["${result_key}_status"]="failed"
                    log_warning "$agent_name: Monitor failed in quick check"
                fi
            else
                # Full mode: run and capture results
                local agent_output
                if agent_output=$(timeout 60 "$script_path" --json 2>/dev/null); then
                    COMPREHENSIVE_RESULTS["${result_key}_status"]="success"
                    COMPREHENSIVE_RESULTS["${result_key}_data"]="$agent_output"
                    
                    # Extract key metrics
                    local agent_score=$(echo "$agent_output" | jq -r '.quality_score // .performance_score // .testing_score // .security_score // 0' 2>/dev/null || echo "0")
                    local agent_overall=$(echo "$agent_output" | jq -r '.overall_quality // .overall_performance // .overall_testing // .overall_security // "unknown"' 2>/dev/null || echo "unknown")
                    
                    COMPREHENSIVE_RESULTS["${result_key}_score"]=$agent_score
                    COMPREHENSIVE_RESULTS["${result_key}_overall"]="$agent_overall"
                    
                    case "$agent_overall" in
                        "excellent") log_success "$agent_name: Score $agent_score/100 (excellent)" ;;
                        "good") log_success "$agent_name: Score $agent_score/100 (good)" ;;
                        "needs-improvement") log_warning "$agent_name: Score $agent_score/100 (needs improvement)" ;;
                        *) log_warning "$agent_name: Score $agent_score/100 (status: $agent_overall)" ;;
                    esac
                else
                    COMPREHENSIVE_RESULTS["${result_key}_status"]="failed"
                    COMPREHENSIVE_RESULTS["${result_key}_score"]=0
                    log_error "$agent_name: Monitor execution failed"
                fi
            fi
        else
            COMPREHENSIVE_RESULTS["${result_key}_status"]="missing"
            log_warning "$agent_name: Monitor script not found or not executable"
        fi
    done
}

# Workflow Automation Check
check_workflow_automation() {
    local name="Workflow Automation"
    log_section "$name"
    
    local automation_score=0
    local automation_checks=0
    
    # Check package.json scripts
    if [[ -f "package.json" ]]; then
        local npm_scripts=$(jq -r '.scripts | keys[]' package.json 2>/dev/null | wc -l | tr -d ' ')
        if [[ $npm_scripts -ge 10 ]]; then
            log_success "NPM scripts: $npm_scripts automation scripts available"
            automation_score=$((automation_score + 20))
        else
            log_warning "NPM scripts: Only $npm_scripts scripts available"
            automation_score=$((automation_score + 10))
        fi
        ((automation_checks++))
    fi
    
    # Check for CI/CD configuration
    if [[ -f ".github/workflows/ci.yml" || -f ".gitlab-ci.yml" || -f "Jenkinsfile" ]]; then
        log_success "CI/CD: Configuration found"
        automation_score=$((automation_score + 25))
    else
        log_warning "CI/CD: No configuration found"
        automation_score=$((automation_score + 5))
    fi
    ((automation_checks++))
    
    # Check for pre-commit hooks
    if [[ -f ".husky/pre-commit" || -f ".git/hooks/pre-commit" || -f "package.json" ]] && grep -q "husky\|pre-commit" package.json 2>/dev/null; then
        log_success "Pre-commit hooks: Configuration found"
        automation_score=$((automation_score + 20))
    else
        log_warning "Pre-commit hooks: No configuration found"
        automation_score=$((automation_score + 5))
    fi
    ((automation_checks++))
    
    # Check for monitoring scripts
    local monitoring_scripts=$(find scripts/ -name "*monitor*" -executable 2>/dev/null | wc -l | tr -d ' ')
    if [[ $monitoring_scripts -ge 4 ]]; then
        log_success "Monitoring automation: $monitoring_scripts monitoring scripts available"
        automation_score=$((automation_score + 25))
    else
        log_warning "Monitoring automation: Only $monitoring_scripts monitoring scripts available"
        automation_score=$((automation_score + 10))
    fi
    ((automation_checks++))
    
    # Check for development shortcuts
    local dev_scripts=$(find scripts/ -name "*.sh" -executable 2>/dev/null | wc -l | tr -d ' ')
    if [[ $dev_scripts -ge 8 ]]; then
        log_success "Development shortcuts: $dev_scripts automation scripts available"
        automation_score=$((automation_score + 10))
    else
        log_warning "Development shortcuts: Only $dev_scripts scripts available"
        automation_score=$((automation_score + 5))
    fi
    ((automation_checks++))
    
    local final_automation_score=$((automation_score / automation_checks))
    COMPREHENSIVE_RESULTS["automation_score"]=$final_automation_score
    
    if [[ $final_automation_score -ge 80 ]]; then
        COMPREHENSIVE_RESULTS["workflow_automation"]="excellent"
        log_success "$name: Score $final_automation_score/100 (excellent automation)"
    elif [[ $final_automation_score -ge 60 ]]; then
        COMPREHENSIVE_RESULTS["workflow_automation"]="good"
        log_success "$name: Score $final_automation_score/100 (good automation)"
    else
        COMPREHENSIVE_RESULTS["workflow_automation"]="needs-improvement"
        log_warning "$name: Score $final_automation_score/100 (needs more automation)"
    fi
}

# Development Experience Check
check_development_experience() {
    local name="Development Experience"
    log_section "$name"
    
    local dx_score=0
    local dx_issues=0
    
    # Check for hot reload capability
    if docker ps --format "table {{.Names}}" | grep -q "daten-see-app" && curl -f -s --max-time 3 "http://localhost:3000" > /dev/null 2>&1; then
        log_success "Hot reload: Application running and accessible"
        dx_score=$((dx_score + 25))
    else
        log_warning "Hot reload: Application not accessible"
        dx_score=$((dx_score + 5))
        ((dx_issues++))
    fi
    
    # Check for development tools integration
    local dev_deps=$(jq -r '.devDependencies | keys[]' package.json 2>/dev/null | wc -l | tr -d ' ')
    if [[ $dev_deps -ge 15 ]]; then
        log_success "Development tools: $dev_deps dev dependencies (rich tooling)"
        dx_score=$((dx_score + 25))
    else
        log_warning "Development tools: Only $dev_deps dev dependencies"
        dx_score=$((dx_score + 10))
    fi
    
    # Check for debugging capabilities
    if grep -q "sentry\|debug\|devtools" package.json 2>/dev/null; then
        log_success "Debugging tools: Debug tooling available"
        dx_score=$((dx_score + 20))
    else
        log_warning "Debugging tools: Limited debug tooling"
        dx_score=$((dx_score + 5))
    fi
    
    # Check for documentation
    local md_files=$(find . -name "*.md" -not -path "./node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
    if [[ $md_files -ge 5 ]]; then
        log_success "Documentation: $md_files markdown files (well documented)"
        dx_score=$((dx_score + 15))
    else
        log_warning "Documentation: Only $md_files markdown files"
        dx_score=$((dx_score + 5))
    fi
    
    # Check for fast feedback loops
    if [[ -x "scripts/quick-restart.sh" ]] && command -v docker > /dev/null; then
        log_success "Fast feedback: Quick restart capability available"
        dx_score=$((dx_score + 15))
    else
        log_warning "Fast feedback: Limited quick restart capability"
        dx_score=$((dx_score + 5))
        ((dx_issues++))
    fi
    
    COMPREHENSIVE_RESULTS["dx_score"]=$dx_score
    COMPREHENSIVE_RESULTS["dx_issues"]=$dx_issues
    
    if [[ $dx_score -ge 85 ]]; then
        COMPREHENSIVE_RESULTS["development_experience"]="excellent"
        log_success "$name: Score $dx_score/100 (excellent developer experience)"
    elif [[ $dx_score -ge 65 ]]; then
        COMPREHENSIVE_RESULTS["development_experience"]="good"
        log_success "$name: Score $dx_score/100 (good developer experience)"
    else
        COMPREHENSIVE_RESULTS["development_experience"]="needs-improvement"
        log_warning "$name: Score $dx_score/100 (developer experience needs improvement)"
    fi
}

# Calculate overall comprehensive score
calculate_comprehensive_score() {
    local agent_scores=(
        "${COMPREHENSIVE_RESULTS[quality_monitor_score]:-0}"
        "${COMPREHENSIVE_RESULTS[performance_monitor_score]:-0}"
        "${COMPREHENSIVE_RESULTS[testing_monitor_score]:-0}"
        "${COMPREHENSIVE_RESULTS[security_accessibility_monitor_score]:-0}"
        "${COMPREHENSIVE_RESULTS[automation_score]:-0}"
        "${COMPREHENSIVE_RESULTS[dx_score]:-0}"
    )
    
    local total_score=0
    local score_count=0
    
    for score in "${agent_scores[@]}"; do
        if [[ $score -gt 0 ]]; then
            total_score=$((total_score + score))
            ((score_count++))
        fi
    done
    
    if [[ $score_count -gt 0 ]]; then
        OVERALL_SCORE=$((total_score / score_count))
    fi
}

# Generate comprehensive JSON output
generate_comprehensive_json() {
    cat << EOF
{
  "timestamp": "$TIMESTAMP",
  "overall_status": "$OVERALL_STATUS",
  "overall_score": $OVERALL_SCORE,
  "mode": "$(if [[ "$QUICK_MODE" == true ]]; then echo "quick"; elif [[ "$FULL_MODE" == true ]]; then echo "full"; else echo "standard"; fi)",
  "docker_integration": {
    "status": "${COMPREHENSIVE_RESULTS[docker_integration]:-unknown}",
    "issues": ${COMPREHENSIVE_RESULTS[docker_issues]:-0},
    "checks_total": ${COMPREHENSIVE_RESULTS[docker_checks_total]:-0}
  },
  "monitoring_agents": {
    "code_quality": {
      "status": "${COMPREHENSIVE_RESULTS[quality_monitor_status]:-unknown}",
      "score": ${COMPREHENSIVE_RESULTS[quality_monitor_score]:-0},
      "overall": "${COMPREHENSIVE_RESULTS[quality_monitor_overall]:-unknown}"
    },
    "performance": {
      "status": "${COMPREHENSIVE_RESULTS[performance_monitor_status]:-unknown}",
      "score": ${COMPREHENSIVE_RESULTS[performance_monitor_score]:-0},
      "overall": "${COMPREHENSIVE_RESULTS[performance_monitor_overall]:-unknown}"
    },
    "testing": {
      "status": "${COMPREHENSIVE_RESULTS[testing_monitor_status]:-unknown}",
      "score": ${COMPREHENSIVE_RESULTS[testing_monitor_score]:-0},
      "overall": "${COMPREHENSIVE_RESULTS[testing_monitor_overall]:-unknown}"
    },
    "security_accessibility": {
      "status": "${COMPREHENSIVE_RESULTS[security_accessibility_monitor_status]:-unknown}",
      "score": ${COMPREHENSIVE_RESULTS[security_accessibility_monitor_score]:-0},
      "overall": "${COMPREHENSIVE_RESULTS[security_accessibility_monitor_overall]:-unknown}"
    },
    "infrastructure": {
      "status": "${COMPREHENSIVE_RESULTS[api_health_check_status]:-unknown}"
    }
  },
  "workflow": {
    "automation": {
      "status": "${COMPREHENSIVE_RESULTS[workflow_automation]:-unknown}",
      "score": ${COMPREHENSIVE_RESULTS[automation_score]:-0}
    },
    "development_experience": {
      "status": "${COMPREHENSIVE_RESULTS[development_experience]:-unknown}",
      "score": ${COMPREHENSIVE_RESULTS[dx_score]:-0},
      "issues": ${COMPREHENSIVE_RESULTS[dx_issues]:-0}
    }
  }
}
EOF
}

# Generate dashboard data file
generate_dashboard_data() {
    local dashboard_data_dir="src/app/debugging-dashboard/data"
    mkdir -p "$dashboard_data_dir"
    
    # Create timestamp-based filename
    local data_file="$dashboard_data_dir/monitoring-$(date +%Y%m%d_%H%M%S).json"
    
    generate_comprehensive_json > "$data_file"
    
    # Create symlink to latest
    local latest_file="$dashboard_data_dir/latest.json"
    ln -sf "$(basename "$data_file")" "$latest_file"
    
    if [[ "$JSON_OUTPUT" != true ]]; then
        log_success "Dashboard data saved to: $data_file"
        log_info "Latest data available at: $latest_file"
    fi
}

# Main execution
main() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${CYAN}🚀 Comprehensive Development Monitoring${NC}"
        echo -e "${CYAN}======================================${NC}"
        echo "Timestamp: $TIMESTAMP"
        if [[ "$QUICK_MODE" == true ]]; then
            echo "Mode: Quick Check"
        elif [[ "$FULL_MODE" == true ]]; then
            echo "Mode: Full Analysis"
        else
            echo "Mode: Standard Analysis"
        fi
        echo ""
    fi
    
    # Run all checks
    check_docker_integration
    run_monitoring_agents
    check_workflow_automation
    check_development_experience
    
    # Calculate final scores
    calculate_comprehensive_score
    
    # Generate dashboard data
    if [[ "$QUICK_MODE" != true ]]; then
        generate_dashboard_data
    fi
    
    if [[ "$JSON_OUTPUT" == true ]]; then
        generate_comprehensive_json
    else
        log_section "Comprehensive Summary"
        case "$OVERALL_STATUS" in
            "excellent")
                log_success "🎉 Overall Development Health: EXCELLENT (Score: $OVERALL_SCORE/100)"
                echo "   Your development environment is in excellent condition!"
                ;;
            "good")
                log_success "✅ Overall Development Health: GOOD (Score: $OVERALL_SCORE/100)"
                echo "   Your development environment is working well with minor areas for improvement."
                ;;
            "needs-improvement")
                log_warning "⚠️  Overall Development Health: NEEDS IMPROVEMENT (Score: $OVERALL_SCORE/100)"
                echo "   Several areas need attention to optimize your development workflow."
                ;;
            *)
                log_error "❌ Overall Development Health: CRITICAL (Score: $OVERALL_SCORE/100)"
                echo "   Major issues detected that may impact development productivity."
                ;;
        esac
        
        echo ""
        log_info "Next Steps:"
        echo "  📊 View detailed results: open http://localhost:3000/debugging-dashboard"
        echo "  🔄 Run specific checks: ./scripts/[monitor-name].sh"
        echo "  🐳 Restart services: ./scripts/quick-restart.sh"
        echo "  📈 Full analysis: $0 --full"
    fi
    
    # Exit with appropriate code
    case "$OVERALL_STATUS" in
        "excellent"|"good") exit 0 ;;
        "needs-improvement") exit 1 ;;
        *) exit 2 ;;
    esac
}

# Ensure dependencies
if ! command -v jq &> /dev/null; then
    log_warning "jq not available - some features may be limited"
fi

main "$@"