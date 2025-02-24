import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy, Check, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      description: "Code copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean up the code by removing extra newlines and fixing indentation
  const cleanCode = code.trim().replace(/^\n+|\n+$/g, '');

  // Custom theme modifications
  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: '1.25rem',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.875rem',
      lineHeight: '1.7',
    },
  };

  return (
    <div className="relative rounded-lg overflow-hidden ring-1 ring-zinc-700/50 bg-zinc-900/80 group">
      {/* Code header */}
      <div className="absolute left-0 right-0 top-0 h-8 bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700/50 flex items-center px-4">
        <Terminal className="w-4 h-4 text-zinc-400 mr-2" />
        <span className="text-xs text-zinc-400 font-medium">Python</span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 bg-zinc-800/50 hover:bg-zinc-700/50"
          onClick={copyCode}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-400" />
          ) : (
            <Copy className="h-3 w-3 text-zinc-400" />
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto mt-8">
        <SyntaxHighlighter
          language="python"
          style={customStyle}
          customStyle={{
            background: 'transparent',
          }}
          showLineNumbers={true}
          wrapLongLines={false}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            textAlign: 'right',
            userSelect: 'none',
            color: 'rgb(51, 65, 85)',
          }}
          codeTagProps={{
            className: 'font-mono text-sm',
          }}
        >
          {cleanCode}
        </SyntaxHighlighter>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-[-1px] bg-gradient-to-r from-primary/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}