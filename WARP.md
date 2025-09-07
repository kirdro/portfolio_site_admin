# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a portfolio site admin interface project. The repository is currently empty and ready for initial setup.

## Getting Started

Since this is a new project, you'll need to initialize it first. Common patterns for portfolio admin interfaces include:

### Frontend Framework Options
- React with TypeScript for modern component-based UI
- Next.js for full-stack capabilities with API routes
- Vue.js with Nuxt for server-side rendering
- Vite + React/Vue for fast development experience

### Backend Options
- Node.js with Express for REST API
- Next.js API routes for integrated full-stack
- Python with FastAPI for high-performance API
- Go with Gin for lightweight, fast backend

## Common Setup Commands

### For React/TypeScript Project
```bash
# Create React app with TypeScript
npx create-react-app . --template typescript
# or with Vite
npm create vite@latest . -- --template react-ts
```

### For Next.js Project
```bash
# Create Next.js app with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app
```

### Development Workflow
Once initialized, typical commands will be:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Expected Architecture

Based on the project name "portfolio_site_admin", this will likely include:

### Core Components
- **Authentication System**: Login/logout, user session management
- **Content Management**: CRUD operations for portfolio items
- **Media Management**: Image/file upload and organization
- **Settings Panel**: Site configuration and preferences
- **Dashboard**: Overview of portfolio statistics and recent activity

### Typical Directory Structure
```
src/
├── components/          # Reusable UI components
├── pages/ or routes/    # Page components
├── hooks/              # Custom React hooks
├── services/           # API calls and external services
├── utils/              # Helper functions
├── types/              # TypeScript type definitions
├── store/              # State management (Redux, Zustand, etc.)
└── styles/             # CSS/styling files
```

### Database Considerations
- Portfolio items (projects, skills, experience)
- User authentication data
- Media metadata and references
- Site configuration settings

## Development Guidelines

### Code Organization
- Keep components small and focused
- Use TypeScript for better developer experience
- Implement proper error handling and loading states
- Follow consistent naming conventions

### Authentication & Security
- Implement proper authentication flow
- Validate all inputs on both client and server
- Use environment variables for sensitive configuration
- Implement proper CORS and security headers

### Performance Considerations
- Optimize images and media files
- Implement proper caching strategies
- Use lazy loading for large content
- Monitor bundle size and code splitting

## Environment Setup

Create environment files for different stages:
- `.env.local` for local development
- `.env.staging` for staging environment
- `.env.production` for production

Typical environment variables:
```
NEXT_PUBLIC_API_URL=
DATABASE_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
```

## Testing Strategy

- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test API endpoints and data flow
- **E2E Tests**: Test complete user workflows
- **Visual Tests**: Test UI consistency across browsers

## Deployment

Consider these deployment options:
- **Vercel**: Great for Next.js projects
- **Netlify**: Good for static sites and JAMstack
- **Docker**: For containerized deployments
- **Traditional hosting**: VPS or shared hosting

---

*Note: This WARP.md will be updated as the project structure and requirements become clearer during development.*
