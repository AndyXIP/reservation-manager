import os

import uvicorn
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv()

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        port=port,
        reload=True,
    )