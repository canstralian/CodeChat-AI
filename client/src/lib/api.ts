import { apiRequest } from "./queryClient";
import type { Chat, Message, InsertChat, InsertMessage } from "@shared/schema";

async function handleResponse(response: Response) {
  if (response.status === 401) {
    // Redirect to login for authentication
    window.location.href = '/api/login';
    throw new Error(`${response.status}: Unauthorized - redirecting to login`);
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export const chatApi = {
  createChat: async (data: InsertChat): Promise<Chat> => {
    const response = await apiRequest("POST", "/api/chats", data);
    return response.json();
  },

  getChats: async (): Promise<Chat[]> => {
    try {
      const response = await apiRequest("GET", "/api/chats");
      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        // Redirect to login on authentication error
        window.location.href = '/api/login';
        throw error;
      }
      throw error;
    }
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