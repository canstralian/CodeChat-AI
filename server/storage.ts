import { users, chats, messages, type User, type InsertUser, type Chat, type InsertChat, type Message, type InsertMessage } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentChatId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentChatId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentChatId++;
    const now = new Date();
    const chat: Chat = {
      ...insertChat,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChats(userId?: number): Promise<Chat[]> {
    const allChats = Array.from(this.chats.values());
    if (userId) {
      return allChats.filter(chat => chat.userId === userId);
    }
    return allChats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async updateChat(id: number, updates: Partial<Chat>): Promise<Chat | undefined> {
    const chat = this.chats.get(id);
    if (!chat) return undefined;
    
    const updatedChat = { ...chat, ...updates, updatedAt: new Date() };
    this.chats.set(id, updatedChat);
    return updatedChat;
  }

  async deleteChat(id: number): Promise<boolean> {
    const deleted = this.chats.delete(id);
    // Also delete associated messages
    Array.from(this.messages.entries()).forEach(([msgId, message]) => {
      if (message.chatId === id) {
        this.messages.delete(msgId);
      }
    });
    return deleted;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }
}

export const storage = new MemStorage();
