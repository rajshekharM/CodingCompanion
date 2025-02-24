import { type Message } from "@shared/schema";
import { CodeBlock } from "./code-block";
import { Card } from "@/components/ui/card";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Function to format text with different styles for code and comments
  const formatText = (text: string) => {
    // Split text by code blocks marked with single backticks
    return text.split(/(`[^`]+`)/).map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        // This is inline code
        return (
          <code key={index} className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm">
            {part.slice(1, -1)}
          </code>
        );
      } else {
        // For regular text, handle comments starting with #
        return part.split('\n').map((line, lineIndex) => {
          if (line.trim().startsWith('#')) {
            return (
              <div key={`${index}-${lineIndex}`} className="text-muted-foreground italic font-sans">
                {line}
              </div>
            );
          }
          return (
            <span key={`${index}-${lineIndex}`} className="font-sans">
              {line}
              {lineIndex < part.split('\n').length - 1 && <br />}
            </span>
          );
        });
      }
    });
  };

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-secondary-foreground" />
            </div>
          )}
        </div>

        <Card className={`p-5 space-y-4 shadow-md ${isUser ? 'bg-primary/5' : 'bg-card'}`}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="leading-relaxed text-foreground/90">
              {formatText(message.content)}
            </div>
          </div>

          {message.codeBlocks && message.codeBlocks.map((code, index) => (
            <CodeBlock key={index} code={code} />
          ))}
        </Card>
      </div>
    </div>
  );
}