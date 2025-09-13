# services/spark.py

import openai
import logging
import os

logger = logging.getLogger(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

class SparkClient:
    def __init__(self):
        logger.info("SparkClient initialized with OpenAI")

    async def llm(self, prompt: str, model_name: str = "gpt-4", stream: bool = False):
        try:
            response = openai.ChatCompletion.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                stream=stream
            )
            if stream:
                # Handle streaming if needed
                return [chunk["choices"][0]["delta"].get("content", "") for chunk in response]
            else:
                return response["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}")
            return f"Error: {str(e)}"
