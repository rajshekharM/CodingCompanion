import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

const systemPrompt = `You are a helpful coding assistant specializing in Python and Data Structures & Algorithms (DSA). Your responses should:
1. For coding problems:
   - Provide clear Python solutions with explanations
   - Include time and space complexity analysis
   - Explain the approach step by step
2. For DSA concepts:
   - Explain core concepts clearly
   - Provide relevant examples
   - Include common use cases

Format your response as:
{
  "content": "Your explanation and discussion here",
  "codeBlocks": ["First code block", "Second code block", ...]
}
`;

export async function chat(userMessage: string): Promise<{
  content: string;
  codeBlocks: string[];
}> {
  try {
    const prompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`;
    
    const response = await hf.textGeneration({
      model: "codellama/CodeLlama-34b-Instruct-hf",
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        return_full_text: false,
      },
    });

    // Extract code blocks using regex
    const text = response.generated_text;
    const codeBlockRegex = /```python([\s\S]*?)```/g;
    const codeBlocks: string[] = [];
    let match;
    let content = text;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      codeBlocks.push(match[1].trim());
      content = content.replace(match[0], "");
    }

    // Clean up the content
    content = content.replace(/```/g, "").trim();

    return {
      content,
      codeBlocks,
    };
  } catch (error) {
    console.error("HuggingFace API Error:", error);
    throw new Error("Failed to get response: " + (error as Error).message);
  }
}
