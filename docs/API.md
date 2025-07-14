# API Documentation

This document describes the REST API endpoints for CodeChat AI.

## Base URL

- Development: `http://localhost:5000`
- Production: `https://your-domain.com`

## Authentication

The API uses session-based authentication with cookies. Users must be authenticated to access most endpoints.

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Server creates session and returns session cookie
3. Client includes session cookie in subsequent requests
4. Server validates session for protected routes

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details (optional)"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Endpoints

### Authentication

#### POST /api/auth/login

Authenticate user and create session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid request body
- `401` - Invalid credentials

#### POST /api/auth/logout

Logout user and destroy session.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me

Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Not authenticated

### Chats

#### GET /api/chats

Get all chats for the authenticated user.

**Response:**
```json
{
  "chats": [
    {
      "id": 1,
      "title": "Chat about React hooks",
      "userId": "user_id",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Not authenticated

#### POST /api/chats

Create a new chat.

**Request Body:**
```json
{
  "title": "string (optional)"
}
```

**Response:**
```json
{
  "chat": {
    "id": 1,
    "title": "New Chat",
    "userId": "user_id",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid request body
- `401` - Not authenticated

#### GET /api/chats/:id

Get a specific chat by ID.

**Parameters:**
- `id` (number) - Chat ID

**Response:**
```json
{
  "chat": {
    "id": 1,
    "title": "Chat about React hooks",
    "userId": "user_id",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not authorized to access this chat
- `404` - Chat not found

#### PUT /api/chats/:id

Update a specific chat.

**Parameters:**
- `id` (number) - Chat ID

**Request Body:**
```json
{
  "title": "string (optional)"
}
```

**Response:**
```json
{
  "chat": {
    "id": 1,
    "title": "Updated Chat Title",
    "userId": "user_id",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid request body
- `401` - Not authenticated
- `403` - Not authorized to update this chat
- `404` - Chat not found

#### DELETE /api/chats/:id

Delete a specific chat.

**Parameters:**
- `id` (number) - Chat ID

**Response:**
```json
{
  "message": "Chat deleted successfully"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not authorized to delete this chat
- `404` - Chat not found

### Messages

#### GET /api/chats/:id/messages

Get all messages for a specific chat.

**Parameters:**
- `id` (number) - Chat ID

**Query Parameters:**
- `limit` (number, optional) - Maximum number of messages to return (default: 50)
- `offset` (number, optional) - Number of messages to skip (default: 0)

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "chatId": 1,
      "role": "user",
      "content": "How do I use React hooks?",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "chatId": 1,
      "role": "assistant",
      "content": "React hooks are functions that let you use state and other React features...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not authorized to access this chat
- `404` - Chat not found

#### POST /api/chats/:id/messages

Send a message to a chat and get AI response.

**Parameters:**
- `id` (number) - Chat ID

**Request Body:**
```json
{
  "content": "string",
  "role": "user"
}
```

**Response:**
```json
{
  "userMessage": {
    "id": 1,
    "chatId": 1,
    "role": "user",
    "content": "How do I use React hooks?",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "aiMessage": {
    "id": 2,
    "chatId": 1,
    "role": "assistant",
    "content": "React hooks are functions that let you use state and other React features...",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid request body
- `401` - Not authenticated
- `403` - Not authorized to access this chat
- `404` - Chat not found
- `500` - AI service error

#### DELETE /api/messages/:id

Delete a specific message.

**Parameters:**
- `id` (number) - Message ID

**Response:**
```json
{
  "message": "Message deleted successfully"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not authorized to delete this message
- `404` - Message not found

### Health Check

#### GET /api/health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "ai": "connected"
  }
}
```

## Data Models

### User
```typescript
interface User {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Chat
```typescript
interface Chat {
  id: number;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message
```typescript
interface Message {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute per IP
- **Message endpoints**: 20 requests per minute per user
- **Authentication endpoints**: 5 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## WebSocket Events

The application uses WebSocket for real-time features:

### Connection
```javascript
const socket = new WebSocket('ws://localhost:5000');
```

### Events

#### typing
Sent when user starts typing:
```json
{
  "event": "typing",
  "chatId": 1,
  "userId": "user_id"
}
```

#### message
Sent when a new message is created:
```json
{
  "event": "message",
  "chatId": 1,
  "message": {
    "id": 1,
    "chatId": 1,
    "role": "user",
    "content": "Hello",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### ai_response
Sent when AI response is being generated:
```json
{
  "event": "ai_response",
  "chatId": 1,
  "status": "generating" | "complete" | "error",
  "content": "partial response content"
}
```

## Code Examples

### JavaScript (Node.js)
```javascript
const fetch = require('node-fetch');

// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'user',
    password: 'password'
  })
});

const { user } = await loginResponse.json();

// Create chat
const chatResponse = await fetch('http://localhost:5000/api/chats', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': loginResponse.headers.get('set-cookie')
  },
  body: JSON.stringify({
    title: 'My Chat'
  })
});

const { chat } = await chatResponse.json();

// Send message
const messageResponse = await fetch(`http://localhost:5000/api/chats/${chat.id}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': loginResponse.headers.get('set-cookie')
  },
  body: JSON.stringify({
    content: 'Hello, AI!',
    role: 'user'
  })
});

const { userMessage, aiMessage } = await messageResponse.json();
```

### Python
```python
import requests

# Login
login_response = requests.post('http://localhost:5000/api/auth/login', json={
    'username': 'user',
    'password': 'password'
})

session = requests.Session()
session.cookies.update(login_response.cookies)

# Create chat
chat_response = session.post('http://localhost:5000/api/chats', json={
    'title': 'My Chat'
})

chat = chat_response.json()['chat']

# Send message
message_response = session.post(f'http://localhost:5000/api/chats/{chat["id"]}/messages', json={
    'content': 'Hello, AI!',
    'role': 'user'
})

messages = message_response.json()
```

### cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "password"}' \
  -c cookies.txt

# Create chat
curl -X POST http://localhost:5000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"title": "My Chat"}' \
  -b cookies.txt

# Send message
curl -X POST http://localhost:5000/api/chats/1/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, AI!", "role": "user"}' \
  -b cookies.txt
```

## API Versioning

The API uses URL versioning:
- Current version: `v1`
- Base URL: `/api/v1`

Future versions will be available at `/api/v2`, etc.

## Support

For API support:
- Check the GitHub issues
- Read the documentation
- Contact the maintainers