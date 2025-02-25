import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ChatInputProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput("");

      // Move optimistic update to after submission only
      queryClient.setQueryData(["/api/messages"], (old: any) => {
        if (!Array.isArray(old)) return old;
        return [
          ...old,
          {
            id: Date.now(),
            role: "user",
            content: input.trim(),
            codeBlocks: [],
            timestamp: new Date().toISOString(),
          },
        ];
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about Python, ML, Data Science, or Deep Learning..."
        className="min-h-[60px] resize-none flex-1 shadow-sm focus-visible:ring-primary bg-zinc-800/50 border-zinc-700/50 placeholder:text-zinc-500 font-[450] tracking-wide"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={isLoading || !input.trim()}
        className="px-5 shadow-sm bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 transition-all disabled:from-zinc-700 disabled:to-zinc-700"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}