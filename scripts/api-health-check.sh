#!/bin/bash

# API Health Check Script
# Validates critical API endpoints and external service connectivity
# Usage: ./scripts/api-health-check.sh [--json]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_URL="http://localhost:3000"
TIMEOUT=10
JSON_OUTPUT=false

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

# Health check results
declare -A HEALTH_CHECKS
OVERALL_STATUS="healthy"

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
    OVERALL_STATUS="warning"
}

log_error() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        echo -e "${RED}❌ $1${NC}"
    fi
    OVERALL_STATUS="critical"
}

# Health check functions
check_app_availability() {
    local endpoint="$APP_URL"
    local name="App Availability"
    
    if curl -f -s --max-time $TIMEOUT "$endpoint" > /dev/null 2>&1; then
        HEALTH_CHECKS["app_availability"]="healthy"
        log_success "$name: OK"
        return 0
    else
        HEALTH_CHECKS["app_availability"]="critical"
        log_error "$name: Failed to connect to $endpoint"
        return 1
    fi
}

check_api_routes() {
    local routes=(
        "/api/health"
        "/api/dashboards"
        "/api/auth/status"
    )
    
    local healthy=0
    local total=${#routes[@]}
    
    for route in "${routes[@]}"; do
        local url="$APP_URL$route"
        if curl -f -s --max-time $TIMEOUT "$url" > /dev/null 2>&1; then
            ((healthy++))
            log_success "API Route $route: OK"
        else
            log_warning "API Route $route: Not responding"
        fi
    done
    
    if [[ $healthy -eq $total ]]; then
        HEALTH_CHECKS["api_routes"]="healthy"
    elif [[ $healthy -gt 0 ]]; then
        HEALTH_CHECKS["api_routes"]="warning"
    else
        HEALTH_CHECKS["api_routes"]="critical"
    fi
    
    log_info "API Routes: $healthy/$total healthy"
}

check_docker_containers() {
    local containers=("daten-see-app")
    local healthy=0
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^$container$"; then
            local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")
            if [[ "$health" == "healthy" ]] || [[ "$health" == "unknown" ]]; then
                ((healthy++))
                log_success "Container $container: Running"
            else
                log_warning "Container $container: Health status - $health"
            fi
        else
            log_error "Container $container: Not running"
        fi
    done
    
    if [[ $healthy -eq ${#containers[@]} ]]; then
        HEALTH_CHECKS["docker_containers"]="healthy"
    elif [[ $healthy -gt 0 ]]; then
        HEALTH_CHECKS["docker_containers"]="warning"
    else
        HEALTH_CHECKS["docker_containers"]="critical"
    fi
}

check_memory_usage() {
    local container="daten-see-app"
    if docker ps --format "table {{.Names}}" | grep -q "^$container$"; then
        local memory_usage=$(docker stats --no-stream --format "{{.MemPerc}}" "$container" 2>/dev/null | sed 's/%//')
        
        if [[ -n "$memory_usage" ]]; then
            HEALTH_CHECKS["memory_usage"]=$memory_usage
            
            if (( $(echo "$memory_usage < 70" | bc -l) )); then
                log_success "Memory Usage: ${memory_usage}% (Normal)"
            elif (( $(echo "$memory_usage < 85" | bc -l) )); then
                log_warning "Memory Usage: ${memory_usage}% (High)"
            else
                log_error "Memory Usage: ${memory_usage}% (Critical)"
            fi
        else
            HEALTH_CHECKS["memory_usage"]="unknown"
            log_warning "Memory Usage: Unable to determine"
        fi
    else
        HEALTH_CHECKS["memory_usage"]="container_not_running"
        log_error "Memory Usage: Container not running"
    fi
}

check_build_artifacts() {
    local artifacts=(
        ".next/build-manifest.json"
        "package.json"
        "next.config.js"
    )
    
    local found=0
    local total=${#artifacts[@]}
    
    for artifact in "${artifacts[@]}"; do
        if [[ -f "$artifact" ]]; then
            ((found++))
            log_success "Build Artifact $artifact: Found"
        else
            log_warning "Build Artifact $artifact: Missing"
        fi
    done
    
    if [[ $found -eq $total ]]; then
        HEALTH_CHECKS["build_artifacts"]="healthy"
    elif [[ $found -gt 0 ]]; then
        HEALTH_CHECKS["build_artifacts"]="warning"
    else
        HEALTH_CHECKS["build_artifacts"]="critical"
    fi
}

# Generate JSON output
generate_json_output() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat << EOF
{
  "timestamp": "$timestamp",
  "overall_status": "$OVERALL_STATUS",
  "checks": {
    "app_availability": "${HEALTH_CHECKS[app_availability]}",
    "api_routes": "${HEALTH_CHECKS[api_routes]}",
    "docker_containers": "${HEALTH_CHECKS[docker_containers]}",
    "memory_usage": "${HEALTH_CHECKS[memory_usage]}",
    "build_artifacts": "${HEALTH_CHECKS[build_artifacts]}"
  }
}
EOF
}

# Main execution
main() {
    if [[ "$JSON_OUTPUT" != true ]]; then
        log_info "Starting API Health Check..."
        echo ""
    fi
    
    # Run all checks
    check_app_availability
    check_api_routes
    check_docker_containers
    check_memory_usage
    check_build_artifacts
    
    if [[ "$JSON_OUTPUT" == true ]]; then
        generate_json_output
    else
        echo ""
        case "$OVERALL_STATUS" in
            "healthy")
                log_success "Overall Status: HEALTHY ✅"
                ;;
            "warning")
                log_warning "Overall Status: WARNING ⚠️"
                ;;
            "critical")
                log_error "Overall Status: CRITICAL ❌"
                ;;
        esac
    fi
    
    # Exit with appropriate code
    case "$OVERALL_STATUS" in
        "healthy") exit 0 ;;
        "warning") exit 1 ;;
        "critical") exit 2 ;;
    esac
}

# Check if bc is available (for floating point comparison)
if ! command -v bc &> /dev/null; then
    log_warning "bc not available - some checks may be limited"
fi

main "$@"