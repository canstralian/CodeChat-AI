# Deployment Guide

This guide covers various deployment options for CodeChat AI.

## Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- AI service API keys (OpenAI, OpenRouter, or Anthropic)

## Environment Variables

All deployment methods require these environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Optional* |
| `OPENROUTER_API_KEY` | OpenRouter API key | Optional* |
| `ANTHROPIC_API_KEY` | Anthropic API key | Optional* |
| `NODE_ENV` | Environment (production/development) | No |

*At least one AI service API key is required

## Replit Deployment (Recommended)

CodeChat AI is optimized for Replit deployment with automatic configuration.

### Setup Steps

1. **Import Project**
   - Go to Replit.com
   - Click "Import from GitHub"
   - Enter your repository URL
   - Select "Node.js" as the template

2. **Configure Environment Variables**
   - Open the "Secrets" tab in Replit
   - Add required environment variables:
     ```
     DATABASE_URL=your_database_url
     OPENAI_API_KEY=your_openai_key
     OPENROUTER_API_KEY=your_openrouter_key
     ```

3. **Database Setup**
   - Replit automatically provides a PostgreSQL database
   - The `DATABASE_URL` is set automatically
   - Run database migrations: `npm run db:push`

4. **Deploy**
   - Click the "Deploy" button in Replit
   - Your app will be available at `https://your-app-name.replit.app`

### Replit Configuration

The project includes `.replit` configuration:
- Automatic dependency installation
- Development server on port 5000
- Production build process
- Database connectivity

## Vercel Deployment

### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Project**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add OPENAI_API_KEY
   vercel env add OPENROUTER_API_KEY
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Vercel Configuration

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**/*",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build",
        "outputDirectory": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

## Railway Deployment

### Setup Steps

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL=your_database_url
   railway variables set OPENAI_API_KEY=your_openai_key
   railway variables set OPENROUTER_API_KEY=your_openrouter_key
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Railway Configuration

Create `railway.json`:
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

## Traditional VPS Deployment

### Setup Steps

1. **Server Requirements**
   - Ubuntu 20.04+ or similar
   - Node.js 20+
   - PostgreSQL 14+
   - Nginx (optional, for reverse proxy)

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   ```

3. **Database Setup**
   ```bash
   # Create database user
   sudo -u postgres createuser --interactive
   
   # Create database
   sudo -u postgres createdb codechat_ai
   
   # Set password
   sudo -u postgres psql
   ALTER USER your_user PASSWORD 'your_password';
   ```

4. **Application Setup**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd codechat-ai
   
   # Install dependencies
   npm install
   
   # Set environment variables
   export DATABASE_URL="postgresql://user:password@localhost:5432/codechat_ai"
   export OPENAI_API_KEY="your_openai_key"
   export NODE_ENV="production"
   
   # Build application
   npm run build
   
   # Run database migrations
   npm run db:push
   
   # Start application
   npm start
   ```

5. **Process Management with PM2**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start dist/index.js --name codechat-ai
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

6. **Nginx Configuration (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/codechat_ai
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=codechat_ai
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop
docker-compose down
```

## Database Considerations

### PostgreSQL Setup

1. **Connection Pooling**
   - Use connection pooling for better performance
   - Configure appropriate pool size based on traffic

2. **Backup Strategy**
   ```bash
   # Daily backup
   pg_dump codechat_ai > backup_$(date +%Y%m%d).sql
   
   # Restore
   psql codechat_ai < backup_file.sql
   ```

3. **Performance Optimization**
   - Add appropriate indexes
   - Monitor slow queries
   - Configure PostgreSQL settings for your hardware

### Migration Management

```bash
# Push schema changes
npm run db:push

# Generate migration (if needed)
npx drizzle-kit generate

# Check database status
npx drizzle-kit check
```

## Monitoring and Maintenance

### Health Checks

Add health check endpoint:
```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### Logging

Configure structured logging:
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Security

1. **Environment Variables**
   - Never commit secrets to version control
   - Use secure secret management
   - Rotate API keys regularly

2. **HTTPS**
   - Use HTTPS in production
   - Configure SSL certificates
   - Redirect HTTP to HTTPS

3. **Rate Limiting**
   - Implement rate limiting
   - Monitor for abuse
   - Configure appropriate limits

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall settings

2. **API Key Issues**
   - Verify API keys are valid
   - Check API quotas and limits
   - Monitor API usage

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version
   - Verify all dependencies are installed

### Debugging

```bash
# Check logs
npm run logs

# Debug mode
NODE_ENV=development npm start

# Database connection test
npm run db:check
```

## Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images

### Backend
- Use connection pooling
- Implement caching
- Optimize database queries
- Monitor memory usage

### Database
- Add appropriate indexes
- Optimize queries
- Regular maintenance
- Monitor performance metrics