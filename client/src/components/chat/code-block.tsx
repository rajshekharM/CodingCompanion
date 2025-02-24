import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CodeBlockProps {
  code: string;
}

interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const { toast } = useToast();
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast({
      description: "Code copied to clipboard",
      duration: 2000,
    });
  };

  const executeCode = async () => {
    try {
      setIsExecuting(true);
      setResult(null);

      const response = await apiRequest("POST", "/api/execute", { code });
      const result = await response.json();

      setResult(result);
    } catch (error) {
      toast({
        title: "Execution failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute right-2 top-2 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyCode}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={executeCode}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>

        <SyntaxHighlighter
          language="python"
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            padding: "1rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {result && (
        <div className="rounded-md border p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground mb-2">
            Execution time: {result.executionTime}ms
          </div>
          {result.error ? (
            <div className="text-sm text-destructive whitespace-pre-wrap font-mono">
              {result.error}
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap font-mono">
              {result.output || "No output"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}