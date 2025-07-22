#!/bin/bash

# Daten See v2 - Quick Restart Script
# MANDATORY script per CLAUDE.md: "Nach JEDER Code-Änderung: Automatisch ./scripts/quick-restart.sh ausführen"
# 
# This script provides fast Docker container restart for development workflow:
# Code-Änderung → Docker Restart → Test → Nächste Änderung

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Main script
main() {
    log_info "Starting Daten See v2 quick restart..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "docker-compose.yml" ]]; then
        log_error "docker-compose.yml not found. Run this script from the project root."
        exit 1
    fi
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    # Clean up unused containers and images (optional, can be disabled for speed)
    if [[ "${1}" == "--clean" ]]; then
        log_info "Cleaning up unused Docker resources..."
        docker system prune -f
    fi
    
    # Build and start services
    log_info "Building and starting services..."
    docker-compose up --build -d
    
    # Wait for app to be healthy
    log_info "Waiting for application to be ready..."
    
    # Wait up to 60 seconds for the app to be ready
    for i in {1..60}; do
        if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
            log_success "Application is ready at http://localhost:3000"
            break
        elif [[ $i -eq 60 ]]; then
            log_warning "Application didn't become ready within 60 seconds"
            log_info "Check logs with: docker-compose logs app"
        else
            sleep 1
        fi
    done
    
    # Show container status
    log_info "Container status:"
    docker-compose ps
    
    # Show useful commands
    echo ""
    log_info "Useful commands:"
    echo "  📋 View logs:      docker-compose logs app -f"
    echo "  📊 Performance:    docker stats"
    echo "  🔍 Shell access:   docker-compose exec app sh"
    echo "  🛑 Stop all:       docker-compose down"
    echo ""
    
    log_success "Quick restart completed! 🚀"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Daten See v2 Quick Restart Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --clean    Also clean up unused Docker resources (slower)"
        echo "  --help     Show this help message"
        echo ""
        echo "This script restarts the development environment after code changes."
        echo "Per CLAUDE.md: Code-Änderung → Docker Restart → Test → Nächste Änderung"
        exit 0
        ;;
    --clean)
        main --clean
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