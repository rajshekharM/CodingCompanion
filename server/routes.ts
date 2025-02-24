import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { chat } from "./lib/huggingface";
import { executeCode } from "./lib/codeExecutor";
import { ZodError } from "zod";
import { z } from "zod";

const executeCodeSchema = z.object({
  code: z.string().min(1),
});

export async function registerRoutes(app: Express) {
  app.get("/api/messages", async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post("/api/execute", async (req, res) => {
    try {
      const { code } = executeCodeSchema.parse(req.body);
      const result = await executeCode(code);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Code Execution Error:", error);
        res.status(500).json({ 
          error: "Failed to execute code. Please try again." 
        });
      }
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.addMessage(messageData);

      if (messageData.role === "user") {
        try {
          const aiResponse = await chat(messageData.content);
          const aiMessage = await storage.addMessage({
            role: "assistant",
            content: aiResponse.content,
            codeBlocks: aiResponse.codeBlocks,
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