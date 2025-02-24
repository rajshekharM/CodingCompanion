import { type Message } from "@shared/schema";
import { CodeBlock } from "./code-block";
import { Card } from "@/components/ui/card";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

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

        <Card className={`p-5 space-y-3 shadow-md ${isUser ? 'bg-primary/5' : 'bg-card'}`}>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground/90">{message.content}</div>
          </div>

          {message.codeBlocks && message.codeBlocks.map((code, index) => (
            <CodeBlock key={index} code={code} />
          ))}
        </Card>
      </div>
    </div>
  );
}