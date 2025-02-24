import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about Python or DSA concepts..."
        className="min-h-[60px] resize-none flex-1 shadow-sm focus-visible:ring-primary"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={isLoading || !input.trim()}
        className="px-5 shadow-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}