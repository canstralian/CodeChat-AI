import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile, Code, Bug, Rocket, FileText } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
  isLoading = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    const prompts = {
      "code-review": "Please review this code and provide feedback on best practices, potential issues, and improvements:\n\n",
      "debug": "Help me debug this code. I'm encountering an issue:\n\n",
      "optimize": "How can I optimize this code for better performance?\n\n",
      "document": "Please help me write documentation for this code:\n\n",
    };

    const prompt = prompts[action as keyof typeof prompts] || "";
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about code..."
                className="min-h-[60px] max-h-[200px] resize-none pr-20 rounded-2xl border-gray-300 focus:border-[#0066CC] focus:ring-[#0066CC] placeholder:text-gray-500"
                disabled={disabled}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-[#0066CC] h-8 w-8"
                  disabled={disabled}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-[#0066CC] h-8 w-8"
                  disabled={disabled}
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || disabled}
            className="bg-[#0066CC] text-white hover:bg-blue-700 rounded-full h-12 w-12 flex-shrink-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("code-review")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
            disabled={disabled}
          >
            <Code className="w-4 h-4 mr-2" />
            Code Review
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("debug")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
            disabled={disabled}
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("optimize")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
            disabled={disabled}
          >
            <Rocket className="w-4 h-4 mr-2" />
            Optimize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("document")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
            disabled={disabled}
          >
            <FileText className="w-4 h-4 mr-2" />
            Document
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>AI responses may take a few seconds</span>
        </div>
      </div>
    </div>
  );
}
