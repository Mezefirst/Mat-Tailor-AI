# services/spark.py

import openai
import logging
import os
import asyncio

logger = logging.getLogger(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

class SparkClient:
    def __init__(self):
        logger.info("SparkClient initialized with OpenAI")

    async def llm(self, prompt: str, model_name: str = "gpt-4", stream: bool = False):
        loop = asyncio.get_event_loop()
        try:
            if stream:
                # Run the blocking call in a thread to avoid blocking the event loop
                response = await loop.run_in_executor(
                    None,
                    lambda: openai.ChatCompletion.create(
                        model=model_name,
                        messages=[{"role": "user", "content": prompt}],
                        stream=True
                    )
                )
                # Join all streamed chunks into a single string
                return "".join(chunk["choices"][0]["delta"].get("content", "") for chunk in response)
            else:
                response = await loop.run_in_executor(
                    None,
                    lambda: openai.ChatCompletion.create(
                        model=model_name,
                        messages=[{"role": "user", "content": prompt}],
                        stream=False
                    )
                )
                return response["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}")
            return f"Error: {str(e)}"
        