import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `You are a helpful coding assistant specializing in Python and Data Structures & Algorithms (DSA). Your responses should:
1. For coding problems:
   - Provide clear Python solutions with explanations
   - Include time and space complexity analysis
   - Explain the approach step by step
2. For DSA concepts:
   - Explain core concepts clearly
   - Provide relevant examples
   - Include common use cases

Please format your response as a JSON object with the following structure:
{
  "content": "Your explanation and discussion here",
  "codeBlocks": ["First code block", "Second code block", ...]
}
Always format code blocks using Python syntax highlighting.`;

export async function chat(userMessage: string): Promise<{
  content: string;
  codeBlocks: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.content || "",
      codeBlocks: result.codeBlocks || []
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to get response from AI: " + (error as Error).message);
  }
}