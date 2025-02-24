import { type Message } from "@shared/schema";
import { CodeBlock } from "./code-block";
import { Card } from "@/components/ui/card";
import { User, Bot, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const getDetails = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/messages", {
        role: "user",
        content: "Please explain the previous answer in more detail",
        codeBlocks: [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  // Format text with syntax highlighting
  const formatText = (text: string) => {
    const parts = text.split(/(`[^`]+`)/);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded-md bg-zinc-800/80 font-mono text-sm text-emerald-300 transition-colors">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Basic text with keyword highlighting
      const formattedText = part
        .split('\n')
        .map((line, i) => {
          const highlighted = line
            .replace(/(import|from|def|class|return|if|else|for|while)\b/g, 
              '<span class="text-violet-400">$1</span>')
            .replace(/(".*?"|'.*?')/g, 
              '<span class="text-amber-300">$1</span>')
            .replace(/\b(\d+)\b/g, 
              '<span class="text-cyan-300">$1</span>');

          return (
            <span key={i} className="block leading-7 tracking-wide">
              <span 
                className="font-[450] antialiased"
                dangerouslySetInnerHTML={{ __html: highlighted }} 
              />
            </span>
          );
        });

      return <span key={index}>{formattedText}</span>;
    });
  };

  const showMoreButton = !isUser && message.content.includes("I can provide more");

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg ring-2 ring-primary/20">
              <User className="w-5 h-5 text-zinc-900" />
            </div>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-violet-500/20">
              <Bot className="w-5 h-5 text-zinc-900" />
            </div>
          )}
        </div>

        <Card 
          className={`group relative p-5 space-y-4 shadow-lg backdrop-blur-sm 
            transition-all duration-300 hover:shadow-xl
            ${isUser 
              ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-primary/50' 
              : 'bg-zinc-800/30 border-zinc-800/50 hover:border-violet-500/50'
            }`}
        >
          <div className="prose prose-sm max-w-none prose-invert">
            <div className="space-y-3 font-sans text-[15px]">
              {formatText(message.content)}
            </div>
          </div>

          {message.codeBlocks && message.codeBlocks.length > 0 && (
            <div className="space-y-4 mt-4">
              {message.codeBlocks.map((code, index) => (
                <CodeBlock key={index} code={code.trim()} />
              ))}
            </div>
          )}

          {showMoreButton && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full justify-center hover:bg-violet-500/10 text-violet-400 transition-colors"
              onClick={() => getDetails.mutate()}
              disabled={getDetails.isPending}
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Show detailed explanation
            </Button>
          )}

          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-zinc-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}