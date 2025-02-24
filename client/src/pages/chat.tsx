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
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Python & DSA Assistant
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => clearChat.mutate()}
          disabled={clearChat.isPending}
          className="hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-5 w-5 text-destructive" />
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Start a conversation by asking a Python or DSA question!</p>
              <p className="text-sm mt-2">Example: "Explain how to implement a binary search tree"</p>
            </div>
          ) : (
            messages?.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>
      </main>

      <footer className="border-t bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <ChatInput
            onSubmit={(content) => sendMessage.mutate(content)}
            isLoading={sendMessage.isPending}
          />
        </div>
      </footer>
    </div>
  );
}