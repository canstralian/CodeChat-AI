import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Plus } from "lucide-react";
import MessageItem from "./message-item";
import MessageInput from "./message-input";
import TypingIndicator from "./typing-indicator";
import { chatApi } from "@/lib/api";
import type { Message, Chat } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  selectedChatId: number | null;
  onChatCreated: (chatId: number) => void;
  onMenuToggle: () => void;
}

export default function ChatInterface({
  selectedChatId,
  onChatCreated,
  onMenuToggle,
}: ChatInterfaceProps) {
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/chats", selectedChatId, "messages"],
    enabled: !!selectedChatId,
  });

  const createChatMutation = useMutation({
    mutationFn: chatApi.createChat,
    onSuccess: (chat) => {
      onChatCreated(chat.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, message }: { chatId: number; message: string }) =>
      chatApi.sendMessage(chatId, { role: "user", content: message }),
    onSuccess: () => {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    if (!selectedChatId) {
      // Create new chat first
      const newChat = await createChatMutation.mutateAsync({
        title: "New Chat",
        userId: null,
      });
      setIsTyping(true);
      sendMessageMutation.mutate({ chatId: newChat.id, message });
    } else {
      setIsTyping(true);
      sendMessageMutation.mutate({ chatId: selectedChatId, message });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-[#1E293B]">CodeChat AI</h1>
          </div>
          <Button
            onClick={() => onChatCreated(0)}
            className="bg-[#0066CC] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 lg:p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {!selectedChatId && messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0066CC] to-[#6B73FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Welcome to CodeChat AI</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your AI-powered coding assistant for code generation, review, and debugging. Ask me anything about code!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))
          )}

          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending}
        isLoading={sendMessageMutation.isPending}
      />
    </div>
  );
}
