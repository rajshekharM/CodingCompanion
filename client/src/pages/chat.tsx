import { useQuery, useMutation } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { ChatInput } from "@/components/chat/input";
import { ChatMessage } from "@/components/chat/message";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        role: "user",
        content,
        codeBlocks: [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearChat = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/messages");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Python & DSA Assistant
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => clearChat.mutate()}
          disabled={clearChat.isPending}
        >
          <Trash2 className="h-5 w-5 text-destructive" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p className="text-lg">Start a conversation by asking a Python or DSA question!</p>
              <p className="text-sm mt-2">Example: "Explain how to implement a binary search tree"</p>
            </div>
          ) : (
            messages?.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t bg-background">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSubmit={(content) => sendMessage.mutate(content)}
            isLoading={sendMessage.isPending}
          />
        </div>
      </div>
    </div>
  );
}