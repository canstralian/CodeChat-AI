# CodeChat AI - Repository Guide

## Overview

This is a full-stack TypeScript application built as a CodeChat AI interface. It provides a chat-based interface for developers to interact with AI for code-related tasks like debugging, code reviews, optimization, and documentation. The application follows a modern web development architecture with React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured via Neon serverless)
- **API Integration**: OpenAI API for AI responses
- **Session Management**: PostgreSQL database with Drizzle ORM for persistent data storage

## Key Components

### Database Schema
The application uses three main entities:
- **Users**: Basic user management with username/password
- **Chats**: Chat sessions with title, timestamps, and user association
- **Messages**: Individual messages within chats with role (user/assistant) and content

### API Structure
RESTful API endpoints:
- `POST /api/chats` - Create new chat
- `GET /api/chats` - List all chats
- `GET /api/chats/:id` - Get specific chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/messages` - Send message and get AI response
- `GET /api/chats/:id/messages` - Get chat messages

### UI Components
- **Chat Interface**: Main chat area with message display and input
- **Sidebar**: Chat history and navigation
- **Message Components**: Specialized rendering for user/AI messages with code block support
- **Code Blocks**: Syntax highlighted code display with copy functionality

## Data Flow

1. User creates a new chat or selects existing chat from sidebar
2. User sends message through chat interface
3. Frontend sends message to backend API
4. Backend stores user message and calls OpenAI API
5. AI response is processed and stored as assistant message
6. Both messages are returned to frontend
7. Frontend updates chat interface with new messages
8. Chat title is auto-generated for new chats based on first message

## External Dependencies

### Core Dependencies
- **OpenAI API**: For AI chat responses using GPT-4o model
- **Neon Database**: PostgreSQL hosting via serverless connection
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle ORM**: Type-safe database ORM

### Development Tools
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety and better developer experience
- **ESLint/Prettier**: Code formatting and linting
- **Replit Integration**: Development environment integration

## Deployment Strategy

### Development
- Uses Vite dev server for frontend with HMR
- Express server runs with tsx for TypeScript execution
- Database migrations managed through Drizzle Kit
- Environment variables for database URL and OpenAI API key

### Production
- Frontend built with Vite to static files
- Backend bundled with esbuild for Node.js execution
- Static files served through Express
- Database schema applied via Drizzle migrations

### Key Configuration
- **Database**: Configured for PostgreSQL with connection pooling
- **API Keys**: OpenAI API key required for AI functionality
- **CORS**: Configured for cross-origin requests in development
- **Session Management**: PostgreSQL database with persistent storage for all data

## Recent Changes

### Database Integration (July 11, 2025)
- **Added PostgreSQL database**: Replaced in-memory storage with persistent PostgreSQL database
- **Updated storage layer**: Implemented DatabaseStorage class using Drizzle ORM for all CRUD operations
- **Schema migration**: Applied database schema with users, chats, and messages tables
- **Verified functionality**: Tested database operations for chat creation and retrieval

The application is designed to be easily deployable on platforms like Replit, Vercel, or traditional hosting with PostgreSQL support.