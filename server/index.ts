
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { secretsManager } from "./services/secrets";

const app = express();

// Enhanced JSON parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Optimized logging middleware with request tracking
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Add request ID to request object for tracking
  (req as any).requestId = requestId;
  
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `[${requestId}] ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Only log response body for non-sensitive endpoints
      if (capturedJsonResponse && !path.includes('/auth') && !path.includes('/admin')) {
        const responseStr = JSON.stringify(capturedJsonResponse);
        if (responseStr.length <= 200) {
          logLine += ` :: ${responseStr}`;
        } else {
          logLine += ` :: ${responseStr.slice(0, 197)}...`;
        }
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Global error handler with enhanced logging
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const requestId = (req as any).requestId || 'unknown';

  // Log error with request context
  console.error(`[${requestId}] Error ${status}: ${message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  res.status(status).json({ 
    message,
    requestId: process.env.NODE_ENV === 'development' ? requestId : undefined
  });
});

// Enhanced server initialization with better error handling
(async () => {
  try {
    console.log('🚀 Starting server initialization...');
    
    // Initialize secrets manager with enhanced error handling
    console.log('🔑 Initializing secrets manager...');
    await secretsManager.validateAllKeys();
    
    // Start periodic validation with optimized interval
    secretsManager.startPeriodicValidation(300000); // 5 minutes
    
    // Register routes with error handling
    const server = await registerRoutes(app);
    
    // Setup development or production environment
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server with enhanced configuration
    const port = 5000;
    const host = "0.0.0.0";
    
    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      log(`✅ Server running on ${host}:${port}`);
      log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Log service status
      const status = secretsManager.getValidationStatus();
      const validServices = Object.values(status).filter(s => s.isValid).length;
      log(`🔑 ${validServices}/${Object.keys(status).length} services validated`);
    });

    // Enhanced graceful shutdown handling
    const cleanup = async () => {
      console.log('🔄 Initiating graceful shutdown...');
      
      try {
        // Stop periodic validation
        secretsManager.cleanup();
        
        // Close server with timeout
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Server shutdown timeout'));
          }, 10000); // 10 second timeout
          
          server.close((err) => {
            clearTimeout(timeout);
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        console.log('✅ Server shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      cleanup();
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      cleanup();
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
