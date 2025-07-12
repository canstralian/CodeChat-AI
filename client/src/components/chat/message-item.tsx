
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share, Copy, Check, Clock, CheckCheck } from "lucide-react";
import CodeBlock from "./code-block";
import type { Message } from "@shared/schema";

interface MessageItemProps {
  message: Message;
  isLatest?: boolean;
  status?: 'sending' | 'delivered' | 'read' | 'error';
}

export default function MessageItem({ message, isLatest = false, status = 'delivered' }: MessageItemProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isAI = message.role === "assistant";

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (hours > 0) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'error':
        return <X className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const parseMessageContent = (content: string) => {
    const parts = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "text",
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return parts;
  };

  const messageParts = parseMessageContent(message.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div className={`max-w-4xl ${isUser ? "max-w-3xl" : ""}`}>
        <div
          className={`rounded-2xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
            isUser
              ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-br-md"
              : "bg-[#F1F5F9] dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-bl-md"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUser
                  ? "bg-gradient-to-br from-[#0066CC] to-[#6B73FF]"
                  : "bg-gradient-to-br from-[#0066CC] to-[#6B73FF]"
              }`}
            >
              {isUser ? (
                <span className="text-white font-medium text-sm">U</span>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              {/* Message Content */}
              <div className="text-[#1E293B] dark:text-white leading-relaxed">
                {messageParts.map((part, index) => (
                  <div key={index}>
                    {part.type === "text" ? (
                      <div className="whitespace-pre-wrap">{part.content}</div>
                    ) : (
                      <CodeBlock language={part.language} code={part.content} />
                    )}
                  </div>
                ))}
              </div>

              {/* Actions and Status */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(message.createdAt)}
                  </span>
                  {isUser && isLatest && (
                    <div className="flex items-center gap-1">
                      {getStatusIcon()}
                      <span className="text-xs text-gray-400 capitalize">{status}</span>
                    </div>
                  )}
                </div>
                
                {isAI && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-[#10B981] h-8 w-8"
                      title="Good response"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 h-8 w-8"
                      title="Poor response"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-[#0066CC] h-8 w-8"
                      onClick={handleCopyMessage}
                      title="Copy message"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-[#0066CC] h-8 w-8"
                      title="Share message"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
