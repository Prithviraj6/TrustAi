import json
from groq import Groq
from app.config import get_settings

settings = get_settings()

client = Groq(api_key=settings.GROQ_API_KEY)

def analyze_text_with_groq(text: str):
    prompt = f"""
    You are TrustAI — an AI that evaluates the trustworthiness of text.
    Analyze the following content and return ONLY valid JSON:
    {{
      "score": 0-100,
      "verdict": "trustworthy" | "neutral" | "risky",
      "citations": ["citation 1", "citation 2"],
      "analysis_markdown": "### Full Markdown Analysis Here"
    }}

    Content to analyze:
    {text}
    """

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    try:
        return json.loads(completion.choices[0].message.content)
    except json.JSONDecodeError:
        return {
            "score": 0,
            "verdict": "error",
            "citations": [],
            "analysis_markdown": "Error parsing AI response."
        }
