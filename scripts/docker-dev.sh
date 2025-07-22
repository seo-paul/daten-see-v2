#!/bin/bash

# Daten See v2 - Docker Development Helper Script
# Additional tools for Docker development workflow

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
    echo "Daten See v2 - Docker Development Helper"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  logs       Show application logs"
    echo "  shell      Open shell in app container"
    echo "  stats      Show container performance stats"
    echo "  clean      Clean up unused Docker resources"
    echo "  rebuild    Force rebuild and restart"
    echo "  status     Show container status"
    echo "  help       Show this help message"
    echo ""
}

case "${1:-}" in
    logs)
        log_info "Showing application logs (Ctrl+C to exit)..."
        docker-compose logs app -f
        ;;
    shell)
        log_info "Opening shell in app container..."
        docker-compose exec app sh
        ;;
    stats)
        log_info "Container performance stats (Ctrl+C to exit)..."
        docker stats
        ;;
    clean)
        log_info "Cleaning up unused Docker resources..."
        docker system prune -f
        docker-compose down --rmi local --volumes --remove-orphans
        log_success "Cleanup completed"
        ;;
    rebuild)
        log_info "Force rebuilding and restarting..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        log_success "Rebuild completed"
        ;;
    status)
        log_info "Container status:"
        docker-compose ps
        echo ""
        log_info "Available services:"
        echo "  🌐 App: http://localhost:3000"
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac