import { apiRequest } from "./queryClient";
import type { Chat, Message, InsertChat, InsertMessage } from "@shared/schema";

export const chatApi = {
  createChat: async (data: InsertChat): Promise<Chat> => {
    const response = await apiRequest("POST", "/api/chats", data);
    return response.json();
  },

  getChats: async (): Promise<Chat[]> => {
    const response = await apiRequest("GET", "/api/chats");
    return response.json();
  },

  getChat: async (id: number): Promise<Chat> => {
    const response = await apiRequest("GET", `/api/chats/${id}`);
    return response.json();
  },

  deleteChat: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/chats/${id}`);
  },

  getMessages: async (chatId: number): Promise<Message[]> => {
    const response = await apiRequest("GET", `/api/chats/${chatId}/messages`);
    return response.json();
  },

  sendMessage: async (chatId: number, message: Omit<InsertMessage, "chatId">): Promise<{
    userMessage: Message;
    aiMessage: Message;
  }> => {
    const response = await apiRequest("POST", `/api/chats/${chatId}/messages`, message);
    return response.json();
  },
};
