import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

const systemPrompt = `You are an expert AI Learning Assistant specializing in Python programming and advanced topics in Machine Learning, Deep Learning, Data Science, and Artificial Intelligence. 

When provided with context from uploaded documents, ALWAYS:
1. First analyze the provided context thoroughly
2. Reference specific parts of the context in your answer
3. If the context is relevant, base your answer primarily on it
4. If the context is not relevant, explicitly mention that you're providing a general answer

Keep responses focused and use code blocks with Python syntax: \`\`\`python [code] \`\`\``;

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

    return {
      content,
      codeBlocks,
    };
  } catch (error) {
    console.error("HuggingFace API Error:", error);
    throw new Error("Failed to get response: " + (error as Error).message);
  }
}