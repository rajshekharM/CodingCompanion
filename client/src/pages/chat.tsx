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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Python & DSA Assistant
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => clearChat.mutate()}
          disabled={clearChat.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </header>

      <main className="flex-1 overflow-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          messages?.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
      </main>

      <footer className="border-t p-4">
        <ChatInput
          onSubmit={(content) => sendMessage.mutate(content)}
          isLoading={sendMessage.isPending}
        />
      </footer>
    </div>
  );
}