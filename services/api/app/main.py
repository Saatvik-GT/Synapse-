from fastapi import FastAPI

from app.routes.issues import router as issues_router

app = FastAPI(title="OpenIssue API", version="0.1.0")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(issues_router)
