import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Temporary authentication bypass for testing purposes
export async function setupTempAuth(app: Express) {
  // Create a test user in the database
  const testUser = {
    id: "test-user-123",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    profileImageUrl: null,
  };

  try {
    await storage.upsertUser(testUser);
    console.log("✅ Test user created/updated");
  } catch (error) {
    console.error("❌ Error creating test user:", error);
  }

  // Middleware to simulate authentication
  const mockAuth: RequestHandler = (req: any, res, next) => {
    // Mock user object for testing
    req.user = {
      claims: {
        sub: testUser.id,
        email: testUser.email,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        profile_image_url: testUser.profileImageUrl,
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };

    req.isAuthenticated = () => true;
    next();
  };

  // Apply mock authentication to all routes
  app.use(mockAuth);

  // Simple auth endpoints for testing
  app.get('/api/auth/user', (req: any, res) => {
    res.json({
      id: req.user.claims.sub,
      email: req.user.claims.email,
      firstName: req.user.claims.first_name,
      lastName: req.user.claims.last_name,
      profileImageUrl: req.user.claims.profile_image_url,
    });
  });

  app.get('/api/login', (req, res) => {
    res.redirect('/');
  });

  app.get('/api/logout', (req, res) => {
    res.redirect('/');
  });
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};