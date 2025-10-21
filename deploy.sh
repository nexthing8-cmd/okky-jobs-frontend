#!/bin/bash

# OKKY Jobs Frontend Deployment Script
echo "🚀 Starting OKKY Jobs Frontend deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create logs directory
mkdir -p logs/nginx

print_status "Building Docker image..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    print_error "Docker build failed!"
    exit 1
fi

print_status "Stopping existing containers..."
docker-compose down

print_status "Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    print_error "Failed to start services!"
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Services are running successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:5173"
    echo "   Health Check: http://localhost:5173/health"
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
    echo ""
    echo "📝 View logs with: docker-compose logs -f"
    echo "🛑 Stop services with: docker-compose down"
else
    print_error "❌ Services failed to start!"
    print_status "Checking logs..."
    docker-compose logs
    exit 1
fi
