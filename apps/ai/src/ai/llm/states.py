from typing import Annotated
from pydantic import BaseModel


class SuggestTaskBodyState(BaseModel):
    task_title: Annotated[str, "The title of the task to suggest"]
