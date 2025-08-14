from pydantic import BaseModel


class SuggestRequest(BaseModel):
    task_title: str
