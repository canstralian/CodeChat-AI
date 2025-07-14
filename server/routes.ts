import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { generateCodeResponse, generateChatTitle } from "./services/openai";
import { secretsManager } from "./services/secrets";
import { setupTempAuth, isAuthenticated } from "./tempAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (temporary for testing)
  await setupTempAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Health check endpoint with API key status
  app.get("/api/health", async (req, res) => {
    try {
      const validationStatus = secretsManager.getValidationStatus();
      const bestConfig = secretsManager.getBestAIConfig();
      
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: validationStatus,
        activeAIService: bestConfig ? bestConfig.service : null,
        hasValidAIService: bestConfig !== null
      });
    } catch (error) {
      res.status(500).json({ 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Create a new chat
  app.post("/api/chats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chatData = insertChatSchema.parse({ ...req.body, userId });
      const chat = await storage.createChat(chatData);
      res.json(chat);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all chats for authenticated user
  app.get("/api/chats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getChats(userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get specific chat
  app.get("/api/chats/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      // Ensure the chat belongs to the authenticated user
      const userId = req.user.claims.sub;
      if (chat.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Delete chat
  app.delete("/api/chats/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      // Ensure the chat belongs to the authenticated user
      const userId = req.user.claims.sub;
      if (chat.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const deleted = await storage.deleteChat(chatId);
      if (!deleted) {
        return res.status(404).json({ error: "Chat not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get messages for a chat
  app.get("/api/chats/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      // Ensure the chat belongs to the authenticated user
      const userId = req.user.claims.sub;
      if (chat.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const messages = await storage.getMessages(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // API Key management endpoints
  app.post("/api/admin/validate-keys", async (req, res) => {
    try {
      await secretsManager.validateAllKeys();
      const status = secretsManager.getValidationStatus();
      res.json({ message: "Validation completed", status });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/admin/key-status", async (req, res) => {
    try {
      const status = secretsManager.getValidationStatus();
      const bestConfig = secretsManager.getBestAIConfig();
      res.json({
        status,
        activeService: bestConfig?.service || null,
        hasValidService: bestConfig !== null
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Send message and get AI response
  app.post("/api/chats/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify chat ownership
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      if (chat.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        chatId
      });

      // Create user message
      const userMessage = await storage.createMessage(messageData);

      // Get chat history for context
      const messages = await storage.getMessages(chatId);
      const chatHistory = messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }));

      // Generate AI response
      const aiResponse = await generateCodeResponse(chatHistory);

      // Create AI message
      const aiMessage = await storage.createMessage({
        chatId,
        role: "assistant",
        content: aiResponse
      });

      // Update chat title if this is the first message
      if (messages.length === 1) {
        const title = await generateChatTitle(messageData.content);
        await storage.updateChat(chatId, { title });
      }

      res.json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
