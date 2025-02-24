import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return apiRequest("POST", "/api/upload", formData);
    },
    onSuccess: () => {
      toast({
        description: "Document uploaded successfully!",
      });
      setFile(null);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-primary/50 transition-colors cursor-pointer"
      >
        <Upload className="w-4 h-4" />
        <span className="text-sm">
          {file ? file.name : "Upload PDF"}
        </span>
      </label>
      {file && (
        <Button
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          variant="ghost"
          size="sm"
          className="bg-primary/10 hover:bg-primary/20"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span className="ml-2">Process Document</span>
        </Button>
      )}
    </div>
  );
}
