import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { generateCodeResponse, generateChatTitle } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new chat
  app.post("/api/chats", async (req, res) => {
    try {
      const chatData = insertChatSchema.parse(req.body);
      const chat = await storage.createChat(chatData);
      res.json(chat);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all chats
  app.get("/api/chats", async (req, res) => {
    try {
      const chats = await storage.getChats();
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific chat
  app.get("/api/chats/:id", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete chat
  app.delete("/api/chats/:id", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const deleted = await storage.deleteChat(chatId);
      if (!deleted) {
        return res.status(404).json({ error: "Chat not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get messages for a chat
  app.get("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const messages = await storage.getMessages(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send message and get AI response
  app.post("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
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
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
