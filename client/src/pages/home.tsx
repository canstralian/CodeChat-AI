import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/chat/sidebar";
import ChatInterface from "@/components/chat/chat-interface";
import type { Chat } from "@shared/schema";

export default function Home() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: chats = [], refetch: refetchChats } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
  });

  const handleNewChat = () => {
    setSelectedChatId(null);
    setIsSidebarOpen(false);
  };

  const handleChatSelect = (chatId: number) => {
    setSelectedChatId(chatId);
    setIsSidebarOpen(false);
  };

  const handleChatCreated = (chatId: number) => {
    setSelectedChatId(chatId);
    refetchChats();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0]">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onChatDeleted={refetchChats}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <ChatInterface
        selectedChatId={selectedChatId}
        onChatCreated={handleChatCreated}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
