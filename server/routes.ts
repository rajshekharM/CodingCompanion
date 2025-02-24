import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { chat } from "./lib/huggingface";
import { ZodError } from "zod";

function truncateResponse(content: string): { content: string, hasMore: boolean } {
  const maxLength = 250; // About 2-3 sentences
  const sentenceEnd = /[.!?]\s+/g;

  if (content.length <= maxLength) {
    return { content, hasMore: false };
  }

  // Find the last complete sentence within maxLength
  const matches = [...content.matchAll(sentenceEnd)];
  const lastSentenceEnd = matches.reduce((last, match) => {
    if (match.index && match.index <= maxLength) {
      return match.index + 1;
    }
    return last;
  }, maxLength);

  return {
    content: content.slice(0, lastSentenceEnd).trim() + "\n\nI can provide more detailed explanation if you'd like.",
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

          // Only truncate if it's not a "show more" request
          const shouldTruncate = !messageData.content.includes("provide more detail") && 
                               !messageData.content.includes("show more");

          let finalContent = aiResponse.content;
          let hasMore = false;

          if (shouldTruncate) {
            const truncated = truncateResponse(aiResponse.content);
            finalContent = truncated.content;
            hasMore = truncated.hasMore;
          }

          const aiMessage = await storage.addMessage({
            role: "assistant",
            content: finalContent,
            codeBlocks: aiResponse.codeBlocks.slice(0, shouldTruncate ? 1 : undefined),
          });
          res.json([message, aiMessage]);
        } catch (error) {
          console.error("AI Response Error:", error);
          res.status(500).json({ 
            error: "Failed to get AI response. Please try again later.",
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
        res.status(500).json({ 
          error: "An unexpected error occurred. Please try again later." 
        });
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