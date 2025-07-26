#!/bin/bash

# Daten See v2 - Code Validation Script
# Docker-compliant validation workflow per CLAUDE.md
# Usage: ./scripts/validate-code.sh [--fix] [--coverage]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_help() {
    echo "Daten See v2 - Code Validation Script"
    echo ""
    echo "Docker-compliant validation per CLAUDE.md workflow"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --fix         Auto-fix ESLint errors where possible"
    echo "  --coverage    Run tests with coverage report"
    echo "  --help        Show this help message"
    echo ""
    echo "Validation sequence:"
    echo "  1. ESLint check"
    echo "  2. TypeScript type check"
    echo "  3. Unit tests"
    echo "  4. Build verification (production build test)"
    echo ""
}

main() {
    log_info "Starting Docker-compliant code validation..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Get container ID
    CONTAINER_ID=$(docker ps -q --filter "name=daten-see-app")
    if [ -z "$CONTAINER_ID" ]; then
        log_error "Daten See app container not running."
        log_info "Start with: ./scripts/quick-restart.sh"
        exit 1
    fi
    
    log_success "Container found: $CONTAINER_ID"
    echo ""
    
    # ESLint validation
    log_info "Step 1/4: ESLint validation..."
    if [[ "${1}" == "--fix" ]]; then
        log_info "Running ESLint with auto-fix..."
        docker exec $CONTAINER_ID npm run lint -- --fix
    else
        docker exec $CONTAINER_ID npm run lint
    fi
    log_success "ESLint check completed"
    echo ""
    
    # TypeScript validation  
    log_info "Step 2/4: TypeScript type checking..."
    docker exec $CONTAINER_ID npm run typecheck
    log_success "TypeScript check completed"
    echo ""
    
    # Unit tests
    log_info "Step 3/4: Unit tests..."
    if [[ "${1}" == "--coverage" ]] || [[ "${2}" == "--coverage" ]]; then
        log_info "Running tests with coverage report..."
        docker exec $CONTAINER_ID npm run test:coverage
    else
        docker exec $CONTAINER_ID npm test
    fi
    log_success "Unit tests completed"
    echo ""
    
    # Build verification
    log_info "Step 4/4: Production build verification..."
    docker exec $CONTAINER_ID npm run build
    log_success "Build verification completed"
    echo ""
    
    log_success "🎉 All validations passed! Code is Docker-compliant."
    echo ""
    log_info "Next steps:"
    echo "  📝 Commit changes: git add . && git commit -m 'Your message'"
    echo "  🚀 Deploy: Follow deployment checklist"
    echo "  📊 Monitor: ./scripts/docker-dev.sh stats"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --fix|--coverage)
        main "$1" "$2"
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information."
        exit 1
        ;;
esac