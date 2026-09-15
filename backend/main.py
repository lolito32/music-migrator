from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Music Migrator API funcionando"}


@app.get("/api/health")
def health():
    return {"status": "ok"}