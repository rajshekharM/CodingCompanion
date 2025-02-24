import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

const systemPrompt = `You are an expert AI Learning Assistant specializing in Python, ML, Data Science, and AI. Important guidelines:

1. Always provide a concise initial response (2-3 sentences max) with a basic code example if relevant
2. For complex topics, mention "I can provide more detailed explanation if you'd like"
3. If user specifically asks for detailed explanation, then provide comprehensive response

Your response format should be:
{
  "content": "Your concise explanation here",
  "codeBlocks": ["Brief code example"],
  "hasMoreDetails": boolean
}`;

export async function chat(userMessage: string): Promise<{
  content: string;
  codeBlocks: string[];
  hasMoreDetails?: boolean;
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

    // Extract code blocks and content
    const text = response.generated_text;
    const codeBlockRegex = /```(?:python)?([\s\S]*?)```/g;
    const codeBlocks: string[] = [];
    let content = text;

    while (true) {
      const match = codeBlockRegex.exec(text);
      if (!match) break;
      codeBlocks.push(match[1].trim());
      content = content.replace(match[0], "");
    }

    // Clean up the content
    content = content
      .replace(/```/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Try to parse as JSON if the response is in JSON format
    try {
      const jsonResponse = JSON.parse(content);
      return {
        content: jsonResponse.content,
        codeBlocks: jsonResponse.codeBlocks || [],
        hasMoreDetails: jsonResponse.hasMoreDetails,
      };
    } catch (e) {
      // If not JSON, return the formatted content and code blocks
      return {
        content,
        codeBlocks,
        hasMoreDetails: content.includes("more detail") || content.includes("detailed explanation"),
      };
    }
  } catch (error) {
    console.error("HuggingFace API Error:", error);
    throw new Error("Failed to get response: " + (error as Error).message);
  }
}