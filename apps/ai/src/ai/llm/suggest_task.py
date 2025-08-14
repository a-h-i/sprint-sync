from typing import Optional
from langchain_core.runnables import RunnableConfig
from ai.llm.callback_handler import CallbackHandler
from ai.llm.states import SuggestTaskBodyState
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage
from langchain_core.callbacks.base import BaseCallbackManager


async def suggest_task(
    state: SuggestTaskBodyState, config: Optional[RunnableConfig] = None
):
    if config is None:
        config = {}
    model = init_chat_model(
        model="gpt-5-mini",
        model_provider="openai",
        temperature=0,
    )
    prompt = """
    The user is creating a ticket on a project task board.
    The user has provided the following title:
    {task_title}
    
    Use the title to generate a description of the task. Only generate the description in plain text, no emojis or markdown.
    """
    system_message = SystemMessage(prompt.format(task_title=state.task_title))
    callback_manager = config.get("callbacks")
    assert isinstance(callback_manager, BaseCallbackManager)
    handler = CallbackHandler()
    callback_manager.add_handler(handler)
    response = await model.ainvoke([system_message], config=config)
    callback_manager.remove_handler(handler)
    return response
