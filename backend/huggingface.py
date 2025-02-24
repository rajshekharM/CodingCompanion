from huggingface_hub import InferenceClient
import os
from typing import Dict, List
from pydantic import BaseModel

client = InferenceClient(token=os.environ["HUGGINGFACE_API_KEY"])

class AIResponse(BaseModel):
    content: str
    code_blocks: List[str]

async def get_ai_response(user_message: str) -> AIResponse:
    system_prompt = """You are a helpful coding assistant specializing in Python and Data Structures & Algorithms (DSA). Your responses should:
1. For coding problems:
   - Provide clear Python solutions with explanations
   - Include time and space complexity analysis
   - Explain the approach step by step
2. For DSA concepts:
   - Explain core concepts clearly
   - Provide relevant examples
   - Include common use cases"""

    prompt = f"{system_prompt}\n\nUser: {user_message}\n\nAssistant:"
    
    try:
        response = await client.text_generation(
            prompt,
            model="codellama/CodeLlama-34b-Instruct-hf",
            max_new_tokens=1000,
            temperature=0.7,
            return_full_text=False
        )

        # Extract code blocks using regex
        text = response.generated_text
        code_blocks: List[str] = []
        content = text

        # Extract code blocks and clean the content
        import re
        code_pattern = r"```python([\s\S]*?)```"
        matches = re.finditer(code_pattern, text)
        
        for match in matches:
            code_blocks.append(match.group(1).strip())
            content = content.replace(match.group(0), "")

        # Clean up the content
        content = content.replace("```", "").strip()

        return AIResponse(
            content=content,
            code_blocks=code_blocks
        )
    except Exception as e:
        raise Exception(f"Failed to get AI response: {str(e)}")
