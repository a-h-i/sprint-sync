import json

from quart import Blueprint, request, make_response
from dataclasses import dataclass
from langgraph.graph import StateGraph, START, END

from ai.llm.states import SuggestTaskBodyState
from ai.llm.suggest_task import suggest_task
from ai.schemas import SuggestRequest

bp = Blueprint("suggest", __name__, url_prefix="/ai")


@dataclass
class ServerSentEvent:
    data: str
    event: str | None = None
    id: int | None = None
    retry: int | None = None

    def encode(self) -> bytes:
        message = f"data: {self.data}"
        if self.event is not None:
            message = f"{message}\nevent: {self.event}"
        if self.id is not None:
            message = f"{message}\nid: {self.id}"
        if self.retry is not None:
            message = f"{message}\nretry: {self.retry}"
        message = f"{message}\n\n"
        return message.encode("utf-8")


async def stream_response(data: SuggestRequest):
    graph = StateGraph(state_schema=SuggestTaskBodyState)
    graph.add_node("suggest", suggest_task)
    graph.add_edge(START, "suggest")
    graph.add_edge("suggest", END)
    compiled = graph.compile()
    async for event in compiled.astream_events(
        {
            "task_title": data.task_title,
        },
        version="v2",
    ):
        if event["event"] == "on_custom_event":
            sse = ServerSentEvent(
                data=json.dumps({"type": event["name"], "payload": event["data"]})
            )
            print(sse.encode())
            yield sse.encode()


@bp.post("/suggest")
async def suggest_task_body():
    data = await request.get_json()
    parsed = SuggestRequest(**data)
    response = await make_response(
        stream_response(parsed),
        {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked",
            "X-Accel-Buffering": "no",
        },
    )
    return response
