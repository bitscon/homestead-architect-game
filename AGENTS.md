# Homestead Architect - Agentic Development Guidelines

## 🎯 Purpose

This document provides guidelines and best practices for AI agents working on the Homestead Architect codebase. It ensures consistent code quality, security, and collaboration practices when multiple agents (human and AI) contribute to the project.

## 📋 Overview

Homestead Architect is a React + TypeScript + Vite application with Supabase backend, Docker development environment, and comprehensive homestead management features. This project uses modern web development practices with shadcn/ui components and follows established coding patterns.

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **UI Components**: shadcn/ui
- **State Management**: React Context + TanStack Query
- **Development**: Docker Compose + hot reload
- **Database**: PostgreSQL with Prisma-like schema

## 🤖 Development Environment

### **Container Setup**
```bash
# Start development environment
docker compose up -d --build

# Stop development environment  
docker compose down

# View logs
docker compose logs -f frontend-dev
```

### **Key URLs**
- Frontend: http://localhost:8081
- Database: localhost:5432
- PgAdmin: http://localhost:5050 (when using `--profile tools`)

### **File Structure**
```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── game/         # Gamification components
├── contexts/          # React contexts (Auth, etc.)
├── features/           # Feature modules (animals, crops, finance)
├── game/              # Gamification logic
├── pages/              # Route/page components
├── lib/                # Utilities and helpers
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## 📜 Coding Standards

### **Import Path Conventions**
```typescript
// ✅ Good
import { Component } from "@/components/ui/component";
import { MyType } from "@/types/mytype";

// ❌ Bad - inconsistent
import { Component } from "@/components/ui/component";
import { MyType } from "@/types/MyType"; // Different naming
```

- Use **absolute imports** from `@/` prefix
- **Prefer named exports** over default exports
- **Keep imports alphabetized** (React, then third-party, then local)

### **TypeScript Guidelines**
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Bad  
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string; // Use created_at instead
}
```

- **Use explicit types** over `any` when possible
- **Prefer interface** over `type` for object shapes
- **Follow consistent naming** (PascalCase for types, camelCase for variables)

### **React Component Patterns**
```typescript
// ✅ Good
const Component = () => {
  const [state, setState] = useState<string>();
  
  return (
    <div>
      <button onClick={() => setState('clicked')}>
        {state}
      </button>
    </div>
  );
};

// ❌ Bad
function Component() {
  const [state, setState] = useState<string>();
  
  return (
    <div>
      <button onClick={setState('clicked')}>
        {state}
      </button>
    </div>
  );
}
```

- **Use function components** with proper props typing
- **Follow hooks rules** (hooks at top level, not in loops)
- **Prefer composition** over inheritance when appropriate

### **API Integration Patterns**
```typescript
// ✅ Good
export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

// ❌ Bad
export const getUserById = async (id: string) => {
  const result = await supabase.from('users').select('*').eq('id', id).single();
  return result;
};
```

- **Always handle errors** from async operations
- **Use proper TypeScript types** for API responses
- **Implement loading states** and error boundaries

## 🔒 Code Quality Checklist

### **Before Committing**
- [ ] Code compiles without TypeScript errors
- [ ] All imports resolve correctly
- [ ] Components follow established patterns
- [ ] API calls include proper error handling
- [ ] No `any` types used without justification
- [ ] Tests pass (if applicable)
- [ ] Linting passes with no warnings

### **Security Considerations**
- [ ] No hardcoded secrets or API keys
- [ ] Proper user data scoping in database queries
- [ ] Input validation and sanitization
- [ ] CORS configuration handled properly
- [ ] Environment variables used correctly

### **Performance Guidelines**
- [ ] Efficient database queries with proper indexing
- [ ] React.memo() for expensive components
- [ ] Proper useMemo and useCallback usage
- [ ] Image optimization and lazy loading
- [ ] Bundle size optimization

## 🐛 Docker Development Standards

### **Container Best Practices**
```dockerfile
# ✅ Good
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# ❌ Bad
FROM node:20-alpine
RUN npm install
COPY . /app
CMD ["npm", "start"]
```

- **Use multi-stage builds** for optimization
- **Leverage Docker layer caching**
- **Use non-root users** for security
- **Set proper health checks**
- **Use .dockerignore** effectively

### **Volume Management**
```yaml
# ✅ Good
services:
  app:
    volumes:
      - .:/app:cached
      - node_modules:/app/node_modules
    environment:
      - NODE_ENV=development

# ❌ Bad
services:
  app:
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
```

- **Use appropriate volume strategies** for different use cases
- **Consider bind mounts vs named volumes** based on needs

## 🔧 Testing Guidelines

### **Unit Testing**
```typescript
// ✅ Good
describe('UserService', () => {
  it('should create user successfully', async () => {
    const user = await createUser({ name: 'Test User', email: 'test@example.com' });
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Test User');
  });
});

// ❌ Bad
describe('UserService', () => {
  it('should create user', () => {
    const user = await createUser({ name: 'Test', email: 'test@example.com' });
    expect(user).toBeTruthy();
  });
});
```

- **Test expected behavior** and edge cases
- **Mock external dependencies** appropriately
- **Use descriptive test names** and assertions
- **Test error conditions** properly

### **Integration Testing**
- Test API endpoints with realistic data
- Test user flows end-to-end
- Test error handling and loading states
- Test database transactions and rollbacks

## 🚀 Workflow Integration

### **Git Workflow**
```yaml
# ✅ Branch naming
- main: Production-ready code
- develop: Active development
- feature/feature-name: Feature development

# Commit message format
fix: fix(user-profile-validation): Add proper email validation to prevent invalid user creation
feat: add(crop-rotation): Implement seasonal crop rotation calendar
chore: update(dependencies): Upgrade React to v18.2.0
```

- **Use feature branches** for new functionality
- **Keep main branch stable** and deployable
- **Use pull requests** for code review and collaboration

### **CI/CD Pipeline**
```yaml
# Test stage
test:
  runs-on: ubuntu-latest
  steps:
    - name: Run tests
      run: npm test
    - name: Build application
      run: npm run build
    
# Deploy stage  
deploy:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: docker build && docker push
```

## 📚 Documentation Standards

### **Code Documentation**
```typescript
/**
 * Creates a new user in the database.
 * 
 * @param userData - User data matching User interface
 * @returns Promise<User> Created user object
 * @throws Error if user creation fails
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  // Implementation
};
```

- **Document public APIs** with examples
- **Include error conditions** and edge cases
- **Use consistent formatting** and markdown structure
- **Document configuration options** and environment variables

### **Commit Message Guidelines**
```bash
# ✅ Good
fix(auth): Prevent SQL injection in login query
feat(animals): Add vaccination tracking for livestock
refactor(database): Optimize slow farm summary query
docs(readme): Update getting started guide with Docker instructions

# ❌ Bad
fixed bug
code changes
update deps
stuff
```

## 🔐 Security Guidelines

### **Data Validation**
```typescript
// ✅ Good
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ❌ Bad
const validateInput = (input: string): boolean => {
  return input.length > 0; // Too permissive
};
```

- **Validate all inputs** on both client and server
- **Use prepared statements** for database queries
- **Sanitize user-generated content** before display
- **Implement rate limiting** for sensitive operations

### **Database Security**
```typescript
// ✅ Good
const getUserById = async (userId: string, currentUser: string): Promise<User | null> => {
  if (userId !== currentUser) {
    throw new Error('Unauthorized: Cannot access other users');
  }
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  return data;
};

// ❌ Bad
const getUserById = async (userId: string): Promise<User | null> => {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  return data; // No authorization check
};
```

- **Always include user scoping** in database queries
- **Use Row Level Security** (RLS) policies
- **Validate ownership** before allowing modifications

### **API Security**
```typescript
// ✅ Good
app.get('/api/animals', authenticateToken, (req, res) => {
  // Authenticated route logic
  return getAnimals();
});

// ❌ Bad
app.get('/api/animals/:id', (req, res) => {
  return getAnimal(req.params.id); // No authentication
});
```

- **Authenticate all API endpoints** that access user data
- **Use HTTPS** in production
- **Validate and sanitize inputs** on all requests
- **Implement proper CORS** configuration

## 🐛 Error Handling Standards

### **Error Boundaries**
```typescript
// ✅ Good
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
        // Report to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// ❌ Bad
const ErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      onError={(error) => console.error(error)} // Insufficient error handling
    >
      {children}
    </ErrorBoundary>
  );
};
```

- **Log errors appropriately** with context and severity
- **Provide fallback UI** for error states
- **Implement retry logic** for transient failures
- **Track errors** for debugging and monitoring

## 📦 Component Library Guidelines

### **Component Structure**
```typescript
// ✅ Good
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   └── index.ts         // Export all components
├── forms/
│   ├── LoginForm.tsx
│   └── AnimalForm.tsx
└── common/
    ├── Layout.tsx
    └── LoadingSpinner.tsx

// ❌ Bad
components/
├── Button.jsx           // Mixed file types
├── index.js             // JavaScript in TypeScript project
├── UserForm.ts         // Poorly structured
└── big-file.tsx         // Monolithic component
```

- **Use consistent file extensions** (.tsx for React with TypeScript)
- **Implement proper prop interfaces** for all components
- **Export components** from organized index files
- **Follow established patterns** from shadcn/ui

### **Component Props**
```typescript
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

// ❌ Bad
const Button = ({ children, onClick, disabled, className, variant }) => {
  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}; // No prop interface
```

- **Always define prop interfaces** explicitly
- **Use forwardRef** when needed
- **Implement proper default values** and optional props

## 🔍 Debugging Guidelines

### **Development Tools**
```bash
# ✅ Good
# Browser DevTools
# React Developer Tools
# Docker Compose logs
# VSCode with TypeScript and React extensions

# ❌ Bad
console.log() everywhere without removal
alert() for debugging in production
Hardcoded values in code
```

- **Use conditional logging** based on environment
- **Implement proper error boundaries**
- **Use meaningful variable and function names**
- **Remove debug code** before deployment

### **Logging Standards**
```typescript
// ✅ Good
const logger = {
  info: (message: string) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
    // Send to error tracking service
  },
  warn: (message: string) => console.warn(`[WARN] ${new Date().toISOString()}: ${message}`)
};

// ❌ Bad
console.log('Debug: user created');
console.log('API call:', apiCall);
throw new Error('Failed to process');
```

- **Use appropriate log levels** (error, warn, info, debug)
- **Include context** in log messages
- **Avoid sensitive data** in production logs
- **Use structured logging** for complex applications

## 🎯 Agent Coordination

### **Multiple Agent Workflow**
```bash
# ✅ Good
git checkout main
git checkout -b feature/user-profile
# Work on feature
git commit -m "feat: add user profile validation"
git push origin feature/user-profile

# Create pull request
gh pr create --title "Add User Profile Validation" --body "Adds proper email validation..."

# Merge when ready
git checkout main
git merge feature/user-profile
git push origin main

# ❌ Bad
# Multiple agents working on main branch simultaneously
git push --force
# Overwriting each other's changes
```

- **Use feature branches** for active development
- **Communicate intent** before starting major work
- **Resolve conflicts** through proper Git workflow
- **Use descriptive commit messages** with conventional format

### **Code Review Process**
```bash
# ✅ Good
# All PRs require review
# Automated CI/CD runs on PR creation
# Use conventional commit messages
# Include tests for new features
# Review focuses on code quality, security, and maintainability

# ❌ Bad
# Direct pushes to main without review
# Large, unreviewed commits
# No testing for significant changes
# Inconsistent coding standards
```

## 🚨 Common Pitfalls to Avoid

### **TypeScript Issues**
- Using `any` type without justification
- Ignoring TypeScript compilation errors
- Inconsistent import/export patterns
- Missing proper type definitions for external libraries

### **React Performance Issues**
- Unnecessary re-renders in components
- Missing React.memo() for expensive components
- Not using proper keys for lists
- Creating functions inside render functions

### **Database Performance**
- N+1 queries in loops
- Missing database indexes
- Not using prepared statements properly
- Fetching too much data unnecessarily

### **Security Vulnerabilities**
- Hardcoded credentials or API keys
- SQL injection vulnerabilities
- Missing input validation
- Inadequate user authorization checks

## 🎓 Best Practices Summary

### **Development Workflow**
1. **Start with `docker compose up -d --build`**
2. **Test changes locally** before committing
3. **Run `npm run lint` and `npm run type-check`** frequently
4. **Use browser DevTools** for React debugging
5. **Check Docker logs** with `docker compose logs -f service-name`

### **Code Quality**
1. **Follow established patterns** in existing codebase
2. **Use shadcn/ui components** instead of creating custom ones
3. **Implement proper error boundaries** and loading states
4. **Write tests** for new functionality
5. **Document complex logic** with clear comments

### **Security**
1. **Never commit secrets** to version control
2. **Use environment variables** for all configuration
3. **Validate inputs** on both client and server
4. **Implement proper authentication** and authorization
5. **Use prepared statements** for database operations

### **Performance**
1. **Use React.memo()** for expensive components
2. **Implement virtualization** for long lists
3. **Optimize database queries** with proper indexing
4. **Use lazy loading** for code splitting
5. **Monitor bundle size** and optimize imports

---

This document serves as the authoritative guide for all development work on the Homestead Architect project. Following these guidelines ensures code quality, maintainability, and successful collaboration across both human and AI contributors.