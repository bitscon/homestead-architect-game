# Docker Development Environment

This setup provides a complete containerized development environment for Homestead Architect using Docker Compose.

## 🚀 Quick Start

### 1. Setup Environment Variables
```bash
# Copy the environment template
cp .env.example.docker .env.local

# Edit .env.local with your actual Supabase credentials
nano .env.local
```

### 2. Start Development Environment
```bash
# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d

# Start with database admin tools
docker-compose --profile tools up
```

### 3. Access the Application
- **Frontend**: http://localhost:8080
- **Database**: localhost:5432 (if using local PostgreSQL)
- **PgAdmin**: http://localhost:5050 (if tools profile is enabled)

## 📁 File Structure

```
├── docker-compose.yml              # Main orchestration file
├── docker-compose.override.yml      # Local development overrides
├── Dockerfile                     # Production build
├── Dockerfile.dev                 # Development environment
├── .env.example.docker             # Environment template
├── scripts/
│   └── init-db.sql               # Database initialization
└── .gitignore                    # Updated to exclude Docker files
```

## 🔧 Services Overview

### frontend-dev
- **Purpose**: React + Vite development server
- **Port**: 8080
- **Features**: Hot module replacement, live reload, TypeScript support
- **Environment**: Development mode with debug panel enabled

### postgres
- **Purpose**: Local PostgreSQL database (optional)
- **Port**: 5432
- **Features**: Auto-initialization with sample data
- **Persistence**: Named volume for data storage

### pgadmin
- **Purpose**: Database administration interface
- **Port**: 5050
- **Profile**: `tools` (optional)
- **Access**: admin@homestead.local / admin123

### frontend-prod
- **Purpose**: Production build testing
- **Port**: 8081
- **Profile**: `production`
- **Features**: nginx serving optimized build

## 🛠️ Development Workflow

### Running Commands
```bash
# Start development with hot reload
docker-compose up frontend-dev

# Rebuild after Dockerfile changes
docker-compose up --build

# View logs for specific service
docker-compose logs -f frontend-dev

# Execute commands inside container
docker-compose exec frontend-dev npm install new-package

# Run linting/testing
docker-compose exec frontend-dev npm run lint
```

### Database Management
```bash
# Connect to local PostgreSQL
docker-compose exec postgres psql -U homestead_user -d homestead_dev

# Reset database
docker-compose down -v  # Removes all volumes
docker-compose up          # Recreates with fresh data

# Access pgAdmin (if tools profile enabled)
# URL: http://localhost:5050
# Email: admin@homestead.local
# Password: admin123
```

### Environment Configuration

#### Development (.env.local)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Homestead Architect
VITE_SHOW_GAME_DEBUG=true          # Shows debug panel
```

#### Local Database (Optional)
```bash
POSTGRES_DB=homestead_dev
POSTGRES_USER=homestead_user
POSTGRES_PASSWORD=homestead_password
```

## 🎯 Common Use Cases

### 1. Daily Development
```bash
# Start environment
docker-compose up -d

# Make code changes (auto-reloads)
# View at http://localhost:8080

# Stop when done
docker-compose down
```

### 2. Testing with Production Build
```bash
# Build and test production version
docker-compose --profile production up --build
# Access at http://localhost:8081
```

### 3. Database Development
```bash
# Start with admin tools
docker-compose --profile tools up

# Manage database via pgAdmin
# Or connect directly via psql
```

### 4. New Developer Onboarding
```bash
# Clone repository
git clone <repo-url>
cd homestead-architect-game

# Setup environment
cp .env.example.docker .env.local
# Edit .env.local with actual credentials

# Start development
docker-compose up
```

## 🔍 Troubleshooting

### Port Conflicts
If ports are already in use:
```bash
# Check what's using ports
lsof -i :8080
lsof -i :5432

# Or change ports in docker-compose.yml
ports:
  - "8081:8080"  # Use different host port
```

### Container Issues
```bash
# Check container status
docker-compose ps

# View logs for errors
docker-compose logs frontend-dev

# Restart specific service
docker-compose restart frontend-dev
```

### Performance Issues
```bash
# Clear node_modules volume if needed
docker-compose down
docker volume rm homestead-architect-game_node_modules
docker-compose up
```

### Build Issues
```bash
# Clear Docker cache and rebuild
docker-compose down --rmi all
docker-compose build --no-cache
docker-compose up
```

## 🏗️ Architecture Details

### Volume Management
- **Source Code**: Bind mounted for live reload
- **node_modules**: Named volume for performance
- **Database Data**: Named volume for persistence
- **pgAdmin Data**: Named volume for settings

### Networking
- **Custom Bridge**: `homestead-network` for service isolation
- **Service Discovery**: Services communicate via network names
- **Port Mapping**: Only expose necessary ports to host

### Security
- **Non-root User**: Containers run as non-root user
- **Environment Variables**: Sensitive data in .env files
- **Health Checks**: Database waits for ready state

### Development Features
- **Hot Reload**: Vite dev server with HMR
- **Component Tagger**: Development-only debugging
- **Source Maps**: Full debugging capabilities
- **Debug Panel**: Gamification debug interface

## 📝 Notes

- The main development workflow uses external Supabase for realistic testing
- Local PostgreSQL is optional and useful for offline development
- All development features (HMR, debug panel, etc.) are enabled
- Production build can be tested locally using the production profile
- Database admin tools are available but require explicit profile activation

For more information about Docker Compose, see the [official documentation](https://docs.docker.com/compose/).