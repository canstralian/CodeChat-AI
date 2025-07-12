
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Settings, Menu, X, Trash2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import type { Chat } from "@shared/schema";
import { chatApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  chats: Chat[];
  selectedChatId: number | null;
  onChatSelect: (chatId: number) => void;
  onNewChat: () => void;
  onChatDeleted: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  chats,
  selectedChatId,
  onChatSelect,
  onNewChat,
  onChatDeleted,
  isOpen,
  onClose,
}: SidebarProps) {
  const [deletingChatId, setDeletingChatId] = useState<number | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const deleteChatMutation = useMutation({
    mutationFn: chatApi.deleteChat,
    onSuccess: () => {
      onChatDeleted();
      toast({
        title: "Chat deleted",
        description: "The chat has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingChatId(null);
    },
  });

  const handleDeleteChat = (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChatId(chatId);
    deleteChatMutation.mutate(chatId);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-80 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col fixed lg:relative z-50 h-full transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0066CC] rounded-lg flex items-center justify-center">
                <MessageSquare className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1E293B] dark:text-white">CodeChat AI</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Code Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <Button
            onClick={onNewChat}
            className="w-full bg-[#0066CC] text-white hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Recent Chats
            </div>

            {chats.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No chats yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a new conversation</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors duration-200 border ${
                    selectedChatId === chat.id
                      ? 'bg-[#F1F5F9] dark:bg-gray-800 border-[#0066CC] border-opacity-50'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700'
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#6B73FF] rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#1E293B] dark:text-white text-sm truncate">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTime(new Date(chat.updatedAt))}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      disabled={deletingChatId === chat.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0066CC] to-[#6B73FF] rounded-full flex items-center justify-center">
              <span className="text-white font-medium">U</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#1E293B] dark:text-white text-sm">Developer</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Premium Plan</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
