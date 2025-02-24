import { messages, type Message, type InsertMessage } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private messages: Message[] = [];
  private nextId = 1;

  async getMessages(): Promise<Message[]> {
    // Return messages sorted by timestamp (newest first)
    return [...this.messages].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      ...insertMessage,
      id: this.nextId++,
      timestamp: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  async clearMessages(): Promise<void> {
    this.messages = [];
    this.nextId = 1;
  }
}

export const storage = new MemStorage();