import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const { toast } = useToast();

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast({
      description: "Code copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <div className="relative rounded-md overflow-hidden ring-1 ring-primary/10">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 bg-muted/50 hover:bg-muted"
        onClick={copyCode}
      >
        <Copy className="h-4 w-4" />
      </Button>

      <SyntaxHighlighter
        language="python"
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}