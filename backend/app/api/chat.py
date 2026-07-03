from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import anthropic

from app.core.config import settings

router = APIRouter()

_SYSTEM_EN = """\
You are Dinero Sabio's AI financial mentor. Your job is to help first-generation Latino investors \
understand financial concepts for the first time. Rules:
- Use plain, friendly language — no jargon without explanation.
- Ground every concept in a culturally relevant analogy (family, food, neighborhood businesses, \
  quinceañera savings, etc.).
- Cover: saving habits, compound interest, diversification, stocks, ETFs, and risk management.
- Keep responses concise — 2-4 short paragraphs max.
- Be encouraging. Many users have never invested before.
- Never give specific investment advice (don't say "buy X stock"). Educate, don't advise.\
"""

_SYSTEM_ES = """\
Eres el mentor financiero de IA de Dinero Sabio. Tu trabajo es ayudar a inversores latinos de \
primera generación a entender conceptos financieros por primera vez. Reglas:
- Usa lenguaje simple y amigable — sin jerga sin explicación.
- Fundamenta cada concepto en una analogía culturalmente relevante (familia, comida, negocios del \
  vecindario, ahorros para quinceañera, etc.).
- Cubre: hábitos de ahorro, interés compuesto, diversificación, acciones, ETFs y gestión del riesgo.
- Mantén las respuestas concisas — máximo 2-4 párrafos cortos.
- Sé motivador. Muchos usuarios nunca han invertido antes.
- Nunca des consejos de inversión específicos (no digas "compra la acción X"). Educa, no aconsejes.\
"""


class Message(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    language: str = "en"    # "en" | "es"


@router.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    system_prompt = _SYSTEM_ES if request.language == "es" else _SYSTEM_EN
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def stream_response():
        with client.messages.stream(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": m.role, "content": m.content} for m in request.messages],
        ) as stream:
            for text in stream.text_stream:
                yield text

    return StreamingResponse(stream_response(), media_type="text/plain; charset=utf-8")