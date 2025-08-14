from langchain_core.callbacks.base import AsyncCallbackHandler
from langchain_core.callbacks import adispatch_custom_event
from pydantic import BaseModel
from uuid import UUID
from typing import Any, Optional, Union
from langchain_core.outputs import ChatGenerationChunk, GenerationChunk


class BaseLLMEvent(BaseModel):
    run_id: str


class LLMNewTokenEvent(BaseLLMEvent):
    token: str


class LLMStartEvent(BaseLLMEvent):
    pass


class LLMEndEvent(BaseLLMEvent):
    pass


class CallbackHandler(AsyncCallbackHandler):
    """
    Translates LLM events to custom events for SSE encoding.
    """

    async def on_llm_new_token(
        self,
        token: str,
        *,
        chunk: Optional[Union[GenerationChunk, ChatGenerationChunk]] = None,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[list[str]] = None,
        **kwargs: Any,
    ) -> None:
        await adispatch_custom_event(
            "ai_token", LLMNewTokenEvent(token=token, run_id=str(run_id)).model_dump()
        )

    async def on_llm_end(self, response, *, run_id: UUID, **kwargs) -> None:
        await adispatch_custom_event(
            "ai_end", LLMEndEvent(run_id=str(run_id)).model_dump()
        )

    async def on_llm_start(
        self,
        *args,
        run_id: UUID,
        **kwargs,
    ) -> None:
        await adispatch_custom_event(
            "ai_start", LLMStartEvent(run_id=str(run_id)).model_dump()
        )
