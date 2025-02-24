import { z } from "zod";

// Message schema for validation
export const insertMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  codeBlocks: z.array(z.string()).default([]),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Message type for the application
export type Message = InsertMessage & {
  id: number;
  timestamp: Date;
};