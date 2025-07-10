import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="relative my-4">
      <div className="flex items-center justify-between bg-[#1E293B] px-4 py-2 rounded-t-lg">
        <span className="text-sm text-gray-300 font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={`copy-btn text-xs ${copied ? 'copied' : ''}`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="bg-[#1E293B] p-4 rounded-b-lg overflow-x-auto">
        <code className="text-sm text-[#F1F5F9] font-mono leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}
