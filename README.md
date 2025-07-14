# CodeChat AI

A sophisticated AI-powered code generation and review web application that provides developers with an intelligent chat interface for code-related tasks including debugging, code reviews, optimization, and documentation.

## Target Audience & Experience Level

### Who This App Is For
- **Professional Developers**: Seeking AI assistance for code reviews, debugging, and optimization
- **Development Teams**: Looking for collaborative code assistance and documentation generation
- **Software Engineering Students**: Advanced learners wanting hands-on experience with modern web technologies
- **Technical Leads**: Needing efficient code review and mentoring tools

### Required Development Experience
- **Intermediate to Advanced**: This project assumes familiarity with modern web development practices
- **TypeScript/JavaScript**: Strong understanding of ES6+, async/await, and type systems
- **React Ecosystem**: Experience with hooks, context, and component lifecycle
- **Backend Development**: Knowledge of REST APIs, databases, and server-side architecture
- **Database Management**: Understanding of SQL, ORMs, and database design principles

### Technologies You Should Know
- **Frontend**: React 18, TypeScript, Tailwind CSS, modern build tools (Vite)
- **Backend**: Node.js, Express.js, RESTful API design
- **Database**: PostgreSQL, SQL queries, database migrations
- **Development Tools**: Git, package managers (npm), environment configuration

### Getting Started Prerequisites
- Comfortable with command-line interfaces
- Experience with environment variable configuration
- Basic understanding of OAuth/authentication flows
- Familiarity with API integrations (OpenAI/OpenRouter)

## Features

- **AI-Powered Chat Interface**: Interactive chat with advanced AI models for code assistance
- **Code Syntax Highlighting**: Beautiful code blocks with syntax highlighting and copy functionality
- **Real-time Messaging**: Instant responses with typing indicators
- **Chat History**: Persistent chat sessions with automatic title generation
- **Dark/Light Theme**: Comprehensive theming support
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Secure Authentication**: User authentication with session management
- **Database Persistence**: All chats and messages are stored in PostgreSQL

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** primitives with shadcn/ui components
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **Vite** for fast development and building

### Backend
- **Express.js** with TypeScript
- **Node.js** with ESM modules
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for data persistence
- **OpenAI/OpenRouter API** integration
- **Passport.js** for authentication

## Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- OpenAI API key or OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd codechat-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/codechat_ai
OPENAI_API_KEY=your_openai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── contexts/      # React contexts
├── server/                # Backend Express application
│   ├── services/          # Business logic and external APIs
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database layer
│   └── index.ts           # Server entry point
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema and types
└── docs/                  # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Chats
- `GET /api/chats` - Get all user chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get specific chat
- `DELETE /api/chats/:id` - Delete chat

### Messages
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message and get AI response

## Database Schema

The application uses three main entities:

- **Users**: User authentication and profile data
- **Chats**: Chat sessions with titles and timestamps
- **Messages**: Individual messages with role (user/assistant) and content

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Optional* |
| `OPENROUTER_API_KEY` | OpenRouter API key | Optional* |
| `NODE_ENV` | Environment (development/production) | No |

*At least one AI service API key is required

### AI Service Configuration

The application supports multiple AI providers:
- **OpenAI**: Direct integration with OpenAI's GPT models
- **OpenRouter**: Access to various AI models through OpenRouter

The system automatically selects the best available service based on configuration and validation.

## Deployment

### Replit (Recommended)

This application is optimized for Replit deployment:

1. Import the project to Replit
2. Set up environment variables in Replit Secrets
3. The application will automatically deploy using the configured workflows

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set up production database and environment variables

3. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.