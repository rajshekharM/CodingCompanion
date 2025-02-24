import { type Message } from "@shared/schema";
import { CodeBlock } from "./code-block";
import { Card } from "@/components/ui/card";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Function to format text with different styles for code and comments
  const formatText = (text: string) => {
    try {
      // Check if the text is a JSON string and parse it
      if (text.trim().startsWith("{") && text.includes('"content"')) {
        const jsonData = JSON.parse(text);
        return formatText(jsonData.content); // Format the actual content
      }

      // Split text by code blocks marked with single backticks
      return text.split(/(`[^`]+`)/).map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          // This is inline code
          return (
            <code key={index} className="px-1.5 py-0.5 rounded-md bg-zinc-800 font-mono text-sm text-emerald-300">
              {part.slice(1, -1)}
            </code>
          );
        } else {
          // For regular text, handle comments starting with #
          return part.split('\n').map((line, lineIndex) => {
            if (line.trim().startsWith('#')) {
              return (
                <div key={`${index}-${lineIndex}`} className="text-zinc-400 italic">
                  {line}
                </div>
              );
            }
            // Format lists and important points
            if (line.trim().match(/^\d+\./)) {
              return (
                <div key={`${index}-${lineIndex}`} className="text-primary font-medium my-1">
                  {line}
                </div>
              );
            }
            if (line.trim().match(/^[-*]/)) {
              return (
                <div key={`${index}-${lineIndex}`} className="text-zinc-300 my-1 ml-2">
                  {line}
                </div>
              );
            }
            return (
              <span key={`${index}-${lineIndex}`} className="text-zinc-200">
                {line}
                {lineIndex < part.split('\n').length - 1 && <br />}
              </span>
            );
          });
        }
      });
    } catch (error) {
      // If JSON parsing fails, return the original text
      return text;
    }
  };

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-zinc-900" />
            </div>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-zinc-300" />
            </div>
          )}
        </div>

        <Card className={`p-5 space-y-4 shadow-lg backdrop-blur-sm ${
          isUser ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-800/30 border-zinc-800'
        }`}>
          <div className="prose prose-sm max-w-none prose-invert">
            <div className="leading-relaxed space-y-2">
              {formatText(message.content)}
            </div>
          </div>

          {message.codeBlocks && message.codeBlocks.length > 0 && (
            <div className="space-y-4 mt-4">
              {message.codeBlocks.map((code, index) => (
                <CodeBlock key={index} code={code.trim()} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}