import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { chat } from "./lib/huggingface";
import { ZodError } from "zod";

function truncateResponse(text: string): { content: string, hasMore: boolean } {
  const maxLength = 250;
  const sentenceEnd = /[.!?]\s+/g;

  if (text.length <= maxLength) {
    return { content: text, hasMore: false };
  }

  // Find a good breakpoint
  let breakpoint = text.substring(0, maxLength).lastIndexOf('.');
  if (breakpoint === -1) breakpoint = text.substring(0, maxLength).lastIndexOf(' ');
  if (breakpoint === -1) breakpoint = maxLength;

  return {
    content: text.substring(0, breakpoint + 1) + "\n\nI can provide more details if you'd like.",
    hasMore: true
  };
}

export async function registerRoutes(app: Express) {
  app.get("/api/messages", async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.addMessage(messageData);

      if (messageData.role === "user") {
        try {
          const aiResponse = await chat(messageData.content);

          // Only truncate if not explicitly asking for details
          const isRequestingDetails = messageData.content.toLowerCase().includes("more detail") || 
                                    messageData.content.toLowerCase().includes("show more");

          let content = aiResponse.content;
          let codeBlocks = aiResponse.codeBlocks;

          if (!isRequestingDetails) {
            const { content: truncatedContent, hasMore } = truncateResponse(content);
            content = truncatedContent;
            // Keep only first code block for brevity
            codeBlocks = codeBlocks.slice(0, 1);
          }

          const aiMessage = await storage.addMessage({
            role: "assistant",
            content: content,
            codeBlocks: codeBlocks,
          });

          res.json([message, aiMessage]);
        } catch (error) {
          console.error("AI Response Error:", error);
          res.status(500).json({ 
            error: "Failed to get AI response",
            messages: [message]
          });
        }
      } else {
        res.json([message]);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Server Error:", error);
        res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  });

  app.delete("/api/messages", async (_req, res) => {
    await storage.clearMessages();
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}