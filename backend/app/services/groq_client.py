import json
import httpx

from app.core.config import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


async def generate_json(system_prompt: str, user_payload: str) -> dict:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.groq_api_key}"
    }
    body = {
        "model": settings.groq_model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"{user_payload}\n\nReturn JSON only, no markdown."
            }
        ],
        "temperature": 0.4,
        "response_format": {"type": "json_object"}
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(GROQ_URL, headers=headers, json=body)
            
            if response.status_code == 429:
                print("[Groq] Rate limited - returning empty result")
                return {}
            if response.status_code != 200:
                print(f"[Groq] Error {response.status_code}: {response.text}")
                return {}
            
            data = response.json()
    except Exception as e:
        print(f"[Groq] Request error: {e}")
        return {}

    try:
        raw_text = data["choices"][0]["message"]["content"]
        # Strip markdown code blocks if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        return json.loads(raw_text.strip()) if raw_text else {}
    except Exception as e:
        print(f"[Groq] Parse error: {e}, raw: {data}")
        return {}
