from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes_results import router as results_router
from backend.api.routes_upload import router as upload_router

import logging
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import HTTPException
import traceback

# Set up persistent error logging
logging.basicConfig(
    filename="backend_error.log",
    filemode="a",
    format="%(asctime)s %(levelname)s %(message)s",
    level=logging.ERROR,
)

app = FastAPI()

@app.exception_handler(Exception)
async def log_unhandled_exception(request: Request, exc: Exception):
    tb = traceback.format_exc()
    logging.error("Unhandled exception: %s\nTraceback:\n%s", exc, tb)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {exc}", "traceback": tb},
    )

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(results_router)


@app.get("/health")
def health():
    return {"status": "ok"}
