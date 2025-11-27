from fastapi import FastAPI

from backend.api.routes_results import router as results_router
from backend.api.routes_upload import router as upload_router

app = FastAPI()
app.include_router(upload_router)
app.include_router(results_router)


@app.get("/health")
def health():
    return {"status": "ok"}
