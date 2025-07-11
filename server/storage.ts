import { users, chats, messages, type User, type InsertUser, type Chat, type InsertChat, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChats(userId?: number): Promise<Chat[]>;
  getChat(id: number): Promise<Chat | undefined>;
  updateChat(id: number, updates: Partial<Chat>): Promise<Chat | undefined>;
  deleteChat(id: number): Promise<boolean>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(chatId: number): Promise<Message[]>;
  deleteMessage(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db
      .insert(chats)
      .values(insertChat)
      .returning();
    return chat;
  }

  async getChats(userId?: number): Promise<Chat[]> {
    if (userId) {
      return await db
        .select()
        .from(chats)
        .where(eq(chats.userId, userId))
        .orderBy(desc(chats.updatedAt));
    }
    return await db
      .select()
      .from(chats)
      .orderBy(desc(chats.updatedAt));
  }

  async getChat(id: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat || undefined;
  }

  async updateChat(id: number, updates: Partial<Chat>): Promise<Chat | undefined> {
    const [updatedChat] = await db
      .update(chats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chats.id, id))
      .returning();
    return updatedChat || undefined;
  }

  async deleteChat(id: number): Promise<boolean> {
    // Delete associated messages first
    await db.delete(messages).where(eq(messages.chatId, id));
    
    // Delete the chat
    const result = await db.delete(chats).where(eq(chats.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessages(chatId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
