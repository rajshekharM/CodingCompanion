import { useQuery, useMutation } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { ChatInput } from "@/components/chat/input";
import { ChatMessage } from "@/components/chat/message";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Trash2, Code2, BrainCog } from "lucide-react";
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
      toast({
        description: "Chat history cleared",
      });
    },
  });

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-background/95">
      <header className="flex justify-between items-center p-4 border-b border-zinc-800 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              AI Learning Assistant
            </h1>
            <p className="text-sm text-zinc-400">
              Python • ML • Data Science • Deep Learning
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <FileUpload />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => clearChat.mutate()}
            disabled={clearChat.isPending}
            className="hover:bg-zinc-800/50"
          >
            <Trash2 className="h-5 w-5 text-zinc-400 hover:text-destructive" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-violet-500/10 text-violet-500">
                <BrainCog className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-zinc-200">
                  Ready to Learn and Code!
                </p>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
                  Upload PDFs for context-aware responses, or ask direct questions about Python, ML, Data Science, or Deep Learning.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mt-6">
                {[
                  "Explain backpropagation in neural networks",
                  "How to implement K-means clustering?",
                  "What's the difference between CNN and RNN?",
                  "Show me how to use scikit-learn for classification"
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => sendMessage.mutate(example)}
                    className="p-3 text-sm text-left rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-primary/50 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages?.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800 bg-card/50 backdrop-blur-sm">
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