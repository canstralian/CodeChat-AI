import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Sidebar } from "@/components/chat/sidebar";
import { api } from "@/lib/api";
import type { Chat, Message } from "@/shared/schema";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, Sparkles, Code2, MessageSquare } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

export default function Home() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: api.getChats,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: () => selectedChatId ? api.getMessages(selectedChatId) : Promise.resolve([]),
    enabled: !!selectedChatId,
  });

  const createChatMutation = useMutation({
    mutationFn: api.createChat,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChatId(newChat.id);
      setSidebarOpen(false);
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: api.deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChatId(null);
    },
  });

  const selectedChat = chats.find((chat: Chat) => chat.id === selectedChatId);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 glass-card border-r z-50 transition-all duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={(chatId) => {
            setSelectedChatId(chatId);
            setSidebarOpen(false);
          }}
          onCreateChat={() => createChatMutation.mutate()}
          onDeleteChat={deleteChatMutation.mutate}
          isCreating={createChatMutation.isPending}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <header className="h-16 border-b glass-card flex items-center justify-between px-6 modern-shadow">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden button-hover"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  CodeChat AI
                </h1>
                {selectedChat && (
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {selectedChat.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl button-hover"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </header>

        {/* Chat interface */}
        <div className="flex-1">
          {selectedChatId ? (
            <ChatInterface
              chatId={selectedChatId}
              messages={messages}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-8 max-w-md fade-in">
                <div className="relative">
                  <div className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center mx-auto modern-shadow-lg">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Welcome to CodeChat AI
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your intelligent coding companion is ready to help with debugging, code reviews, 
                    optimization, and answering all your programming questions.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <Code2 className="h-5 w-5 text-primary" />
                    <span>Code analysis & debugging</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span>Interactive programming help</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>Code optimization suggestions</span>
                  </div>
                </div>

                <Button
                  onClick={() => createChatMutation.mutate()}
                  disabled={createChatMutation.isPending}
                  className="gradient-bg hover:opacity-90 text-white font-medium px-8 py-3 rounded-xl button-hover modern-shadow"
                >
                  {createChatMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Start New Chat
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}