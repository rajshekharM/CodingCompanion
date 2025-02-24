import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

const systemPrompt = `You are an expert AI Learning Assistant specializing in Python programming and advanced topics in Machine Learning, Deep Learning, Data Science, and Artificial Intelligence. Your responses should:

1. For Programming Questions:
   - Provide clear Python solutions with explanations
   - Include time and space complexity analysis
   - Explain the approach step by step
   - Use popular libraries like NumPy, Pandas, scikit-learn, TensorFlow, or PyTorch when relevant

2. For ML/AI Concepts:
   - Explain theoretical concepts clearly with practical examples
   - Include code implementations when applicable
   - Discuss common use cases and best practices
   - Reference relevant research papers or techniques
   - Explain mathematical intuition behind algorithms

3. For Data Science Topics:
   - Show data preprocessing and analysis techniques
   - Demonstrate visualization approaches using libraries like matplotlib or seaborn
   - Explain statistical concepts with practical examples
   - Include data manipulation with Pandas

Format your response as:
{
  "content": "Your explanation and discussion here",
  "codeBlocks": ["First code block", "Second code block", ...]
}`;

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
        max_new_tokens: 2000,  // Increased for longer responses
        temperature: 0.7,
        return_full_text: false,
      },
    });

    // Extract code blocks using regex
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
      if (jsonResponse.content && Array.isArray(jsonResponse.codeBlocks)) {
        return jsonResponse;
      }
    } catch (e) {
      // If not JSON, return the formatted content and code blocks
    }

    return {
      content,
      codeBlocks,
    };
  } catch (error) {
    console.error("HuggingFace API Error:", error);
    throw new Error("Failed to get response: " + (error as Error).message);
  }
}