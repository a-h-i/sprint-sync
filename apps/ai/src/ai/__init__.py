from quart import Quart
from dotenv import load_dotenv

from ai.routes.suggest import bp as suggest_bp

load_dotenv()

app = Quart("ai-service")
app.register_blueprint(suggest_bp)
