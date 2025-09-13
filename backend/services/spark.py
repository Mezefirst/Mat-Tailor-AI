# services/spark.py

from openai import OpenAI
import logging
import os
import asyncio

logger = logging.getLogger(__name__)

class SparkClient:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        logger.info("SparkClient initialized with OpenAI")

    async def llm(self, prompt: str, model_name: str = "gpt-4", stream: bool = False):
        loop = asyncio.get_event_loop()
        try:
            if stream:
                # For streaming, we'd need to handle it differently with the new API
                # For now, let's use the non-streaming version
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.chat.completions.create(
                        model=model_name,
                        messages=[{"role": "user", "content": prompt}],
                        stream=False
                    )
                )
                return response.choices[0].message.content
            else:
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.chat.completions.create(
                        model=model_name,
                        messages=[{"role": "user", "content": prompt}],
                        stream=False
                    )
                )
                return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}")
            return f"Error: {str(e)}"
        