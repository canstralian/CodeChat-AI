
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Sidebar from "@/components/chat/sidebar";
import ChatInterface from "@/components/chat/chat-interface";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Chat } from "@shared/schema";

export default function Home() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication first
  const { data: user, isLoading: authLoading, error: authError } = useAuth();

  const { data: chats = [], refetch: refetchChats } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    queryFn: chatApi.getChats,
    enabled: !!user, // Only fetch chats if user is authenticated
  });

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication failed, the useAuth hook will redirect to login
  if (authError) {
    return (
      <div className="h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleChatCreated = (chatId: number) => {
    if (chatId === 0) {
      // Create new chat
      setSelectedChatId(null);
    } else {
      setSelectedChatId(chatId);
    }
    refetchChats();
    setSidebarOpen(false);
  };

  const handleChatDeleted = () => {
    setSelectedChatId(null);
    refetchChats();
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Desktop Layout with Resizable Panels */}
      <div className="hidden lg:flex h-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <Sidebar
              chats={chats}
              selectedChatId={selectedChatId}
              onChatSelect={setSelectedChatId}
              onNewChat={() => handleChatCreated(0)}
              onChatDeleted={handleChatDeleted}
              isOpen={true}
              onClose={() => {}}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <ChatInterface
              selectedChatId={selectedChatId}
              onChatCreated={handleChatCreated}
              onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex h-full">
        <Sidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onChatSelect={setSelectedChatId}
          onNewChat={() => handleChatCreated(0)}
          onChatDeleted={handleChatDeleted}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <ChatInterface
          selectedChatId={selectedChatId}
          onChatCreated={handleChatCreated}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </div>
  );
}
