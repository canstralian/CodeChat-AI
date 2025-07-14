# Project Structure

This document provides a detailed overview of the CodeChat AI project structure, including file organization, module dependencies, and architectural decisions.

## Directory Structure

```
codechat-ai/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/             # GitHub Actions CI/CD workflows
│   │   ├── ci.yml            # Main CI/CD pipeline
│   │   ├── codeql.yml        # Security analysis
│   │   ├── dependency-review.yml  # Dependency security
│   │   └── release.yml       # Release automation
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   │   ├── bug_report.md     # Bug report template
│   │   └── feature_request.md # Feature request template
│   └── pull_request_template.md # PR template
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── chat/         # Chat-specific components
│   │   │   │   ├── chat-interface.tsx
│   │   │   │   ├── code-block.tsx
│   │   │   │   ├── message-input.tsx
│   │   │   │   ├── message-item.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── typing-indicator.tsx
│   │   │   └── ui/           # Generic UI components (shadcn/ui)
│   │   ├── contexts/         # React contexts
│   │   │   └── theme-context.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-toast.ts
│   │   │   └── useAuth.ts
│   │   ├── lib/              # Utility functions and configurations
│   │   │   ├── api.ts        # API client functions
│   │   │   ├── authUtils.ts  # Authentication utilities
│   │   │   ├── queryClient.ts # React Query configuration
│   │   │   └── utils.ts      # General utilities
│   │   ├── pages/            # Page components
│   │   │   ├── home.tsx      # Main chat interface
│   │   │   └── not-found.tsx # 404 page
│   │   ├── App.tsx           # Main app component and routing
│   │   └── main.tsx          # Application entry point
├── server/                   # Backend Express application
│   ├── services/            # Business logic services
│   │   ├── api-key-utils.ts # API key management
│   │   ├── openai.ts        # AI service integration
│   │   └── secrets.ts       # Secret management
│   ├── db.ts                # Database connection
│   ├── index.ts             # Server entry point
│   ├── replitAuth.ts        # Authentication setup
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Database abstraction layer
│   └── vite.ts              # Vite development server setup
├── shared/                  # Shared code between client and server
│   └── schema.ts            # Database schema and types
├── docs/                    # Project documentation
│   ├── API.md               # API documentation
│   ├── CONTRIBUTING.md      # Contributing guidelines
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── PROJECT_STRUCTURE.md # This file
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore patterns
├── CHANGELOG.md             # Version history
├── LICENSE                  # MIT License
├── README.md                # Project overview
├── SECURITY.md              # Security policy
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Node.js dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── replit.md                # Project guide and preferences
├── tailwind.config.ts       # Tailwind CSS configuration
└── vite.config.ts           # Vite build configuration
```

## Module Dependencies

### Frontend Dependencies

#### Core Framework
- **React 18**: Main UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and development server

#### UI Components
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library

#### State Management
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling
- **Wouter**: Lightweight routing

#### Utilities
- **Zod**: Schema validation
- **date-fns**: Date manipulation
- **Lucide React**: Icon library

### Backend Dependencies

#### Core Framework
- **Express.js**: Web application framework
- **Node.js**: Runtime environment
- **TypeScript**: Type safety

#### Database
- **Drizzle ORM**: Type-safe database ORM
- **PostgreSQL**: Database system
- **Neon**: Serverless PostgreSQL

#### Authentication
- **Passport.js**: Authentication middleware
- **Express Session**: Session management

#### AI Integration
- **OpenAI SDK**: OpenAI API client
- **Anthropic SDK**: Anthropic API client

#### Utilities
- **Zod**: Schema validation
- **WebSocket**: Real-time communication

## File Responsibilities

### Frontend Files

#### `/client/src/App.tsx`
- Main application component
- Routing configuration
- Theme provider setup
- Query client configuration

#### `/client/src/components/chat/`
- **chat-interface.tsx**: Main chat interface component
- **code-block.tsx**: Syntax-highlighted code display
- **message-input.tsx**: Message input component
- **message-item.tsx**: Individual message rendering
- **sidebar.tsx**: Chat history sidebar
- **typing-indicator.tsx**: Typing status indicator

#### `/client/src/lib/`
- **api.ts**: API client functions and types
- **queryClient.ts**: React Query configuration
- **utils.ts**: General utility functions
- **authUtils.ts**: Authentication helper functions

#### `/client/src/hooks/`
- **useAuth.ts**: Authentication state management
- **use-toast.ts**: Toast notification system
- **use-mobile.tsx**: Mobile detection hook

### Backend Files

#### `/server/index.ts`
- Express server setup
- Middleware configuration
- Route registration
- Error handling

#### `/server/routes.ts`
- API endpoint definitions
- Request validation
- Response formatting
- Authentication checks

#### `/server/storage.ts`
- Database abstraction layer
- CRUD operations
- Data validation
- Error handling

#### `/server/services/`
- **openai.ts**: AI service integration
- **secrets.ts**: Secret management
- **api-key-utils.ts**: API key utilities

### Shared Files

#### `/shared/schema.ts`
- Database schema definitions
- Type definitions
- Zod validation schemas
- ORM configuration

## Data Flow

### Request Flow
1. **Client Request**: User interaction triggers API call
2. **Route Handler**: Express route receives and validates request
3. **Authentication**: Passport.js validates user session
4. **Business Logic**: Service layer processes request
5. **Database**: Storage layer handles data operations
6. **Response**: Data flows back through layers to client

### Real-time Flow
1. **WebSocket Connection**: Client establishes connection
2. **Event Handling**: Server processes real-time events
3. **Broadcasting**: Server sends updates to connected clients
4. **UI Updates**: Client updates interface based on events

## Build Process

### Development
1. **Client**: Vite dev server with HMR
2. **Server**: tsx for TypeScript execution
3. **Database**: Drizzle Kit for migrations
4. **Assets**: Vite handles static assets

### Production
1. **Client**: Vite builds to static files
2. **Server**: esbuild bundles for Node.js
3. **Database**: Drizzle migrations applied
4. **Assets**: Optimized and bundled

## Configuration Files

### `/vite.config.ts`
- Vite build configuration
- Plugin setup
- Path aliases
- Development server settings

### `/tailwind.config.ts`
- Tailwind CSS configuration
- Custom theme definitions
- Plugin configurations
- Content paths

### `/drizzle.config.ts`
- Database connection configuration
- Migration settings
- Schema path definitions

### `/postcss.config.js`
- PostCSS plugin configuration
- Tailwind CSS integration
- Autoprefixer setup

## Environment Configuration

### Development
- Vite development server
- Hot module replacement
- Database connection via environment variables
- API key configuration

### Production
- Optimized builds
- Static file serving
- Database connection pooling
- Environment-specific configurations

## Security Considerations

### Input Validation
- Zod schemas for request validation
- SQL injection prevention via ORM
- XSS protection through proper escaping

### Authentication
- Session-based authentication
- Secure cookie configuration
- CSRF protection
- Rate limiting

### Data Protection
- Environment variable management
- Secure API key storage
- Database encryption
- HTTPS enforcement

## Performance Optimizations

### Frontend
- Code splitting with React.lazy
- Bundle optimization with Vite
- Caching with React Query
- Image optimization

### Backend
- Database connection pooling
- Response caching
- Efficient queries with Drizzle
- Memory usage optimization

### Database
- Proper indexing
- Query optimization
- Connection pooling
- Regular maintenance

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Service layer testing
- Utility function testing
- Database operation testing

### Integration Tests
- API endpoint testing
- Database integration testing
- Authentication flow testing
- Real-time functionality testing

### End-to-End Tests
- Complete user journey testing
- Cross-browser compatibility
- Performance testing
- Security testing

## Deployment Architecture

### Development
- Local development server
- Local database instance
- Environment variable configuration
- Hot reloading

### Staging
- Staging server deployment
- Staging database
- CI/CD pipeline integration
- Testing environment

### Production
- Production server deployment
- Production database
- Load balancing
- Monitoring and logging

## Maintenance and Updates

### Dependencies
- Regular dependency updates
- Security vulnerability scanning
- License compliance checking
- Performance impact assessment

### Database
- Regular backups
- Performance monitoring
- Index optimization
- Migration management

### Monitoring
- Application performance monitoring
- Error tracking
- User analytics
- Security monitoring

## Future Considerations

### Scalability
- Horizontal scaling options
- Database sharding considerations
- CDN integration
- Caching strategies

### Features
- Plugin system architecture
- Multi-language support
- Advanced AI integrations
- Collaboration features

### Infrastructure
- Container orchestration
- Microservices architecture
- Event-driven architecture
- Message queuing systems