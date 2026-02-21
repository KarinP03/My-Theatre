from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import httpx
import json
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_FILE = os.path.join(DATA_DIR, "movies.json")
OMDB_API_KEY = os.getenv("OMDB_API_KEY", "")
OMDB_BASE_URL = "https://www.omdbapi.com"


def load_db() -> list[dict]:

    if not os.path.exists(DATA_FILE):
        return []

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    except:
        return []


def save_db(data: list[dict]):

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def success(data=None, total: int | None = None) -> dict:
    return {"success": True, "data": data, "total": total}


def error(msg: str) -> dict:
    return {"success": False, "data": None, "error": msg}


def get_era(year: int) -> str:

    if year < 1930:
        return "silent"
    if year < 1960:
        return "golden"
    if year < 1980:
        return "classic"
    if year < 2000:
        return "modern"
    return "contemporary"


# Request Models


class ManualAddReq(BaseModel):

    title: str
    year: int
    director: str = "Unknown"
    genre: list[str]
    plot: str | None = None  # optional
    runtime: str | None = None  # optional
    imageUrl: str | None = None  # optional
    rating: float | int | None = None  # optional
    tags: list[str] = []  # optional
    notes: str | None = None  # optional

    # Physical collection fields
    format: str | None = None 
    audioQuality: str | None = None  
    purchasedAt: str | None = None 
    watched: bool = False 


class AddOmdbReq(BaseModel):
    
    imdbId: str
    rating: float | int | None = None  # optional
    tags: list[str] = []  # optional
    notes: str | None = None  # optional

    # Physical collection fields
    format: str | None = None
    audioQuality: str | None = None
    purchasedAt: str | None = None
    watched: bool = False


# Routes


@app.get("/")
def root():
    return success({"message": "API is running."})


@app.get("/api/health")
def health():
    return success({"status": "ok"})


@app.get("/api/collections/movies")
def list_movies():
    movies = load_db()
    return success(movies, total=len(movies))


@app.get("/api/collections/movies/search")
def search_movies(q: str):

    movies = load_db()
    q = q.lower()
    res = []

    for m in movies:

        if (
            q in m.get("title", "").lower()
            or q in m.get("director", "").lower()
            or q in m.get("imdbId", "").lower()
            or any(q in str(g).lower() for g in m.get("genre", []))
            or any(q in str(t).lower() for t in m.get("tags", []))
        ):
            res.append(m)

    return success(res, total=len(res))


@app.get("/api/collections/movies/lookup")
async def omdb_lookup(q: str, p: int = 1):

    async with httpx.AsyncClient() as client:

        r = await client.get(
            f"{OMDB_BASE_URL}/?apikey={OMDB_API_KEY}&s={q}&type=movie&page={p}"
        )

        data = r.json()

        if data.get("Response") == "False":
            return success([], total=0)

        results = data.get("Search", [])
        return success(results, total=len(results))


@app.get("/api/collections/movies/{id}")
def get_movie(id: str):

    movies = load_db()

    for m in movies:

        if m.get("id") == id:
            return success(m)

    return error("Movie not found")


@app.post("/api/collections/movies", status_code=201)
def add_manual(req: ManualAddReq):

    movies = load_db()

    new_movie = {
        "id": str(uuid.uuid4()),
        "collectionType": "movie",
        "era": get_era(req.year),
        "dateAdded": datetime.now(tz=timezone.utc).isoformat(),
        **req.model_dump(),
    }

    movies.append(new_movie)
    save_db(movies)

    return success(new_movie)


@app.post("/api/collections/movies/add", status_code=201)
async def add_omdb(req: AddOmdbReq):
    movies = load_db()

    for m in movies:
        if m.get("imdbId") == req.imdbId:
            return success(m)

    async with httpx.AsyncClient() as client:

        r = await client.get(
            f"{OMDB_BASE_URL}/?apikey={OMDB_API_KEY}&i={req.imdbId}&plot=full"
        )
        detail = r.json()

    if detail.get("Response") == "False":
        return error("Could not find movie on OMDB")

    year = int(detail.get("Year", 0))
    poster = detail.get("Poster") if detail.get("Poster") != "N/A" else None

    new_movie = {
        "id": str(uuid.uuid4()),
        "collectionType": "movie",
        "era": get_era(year),
        "dateAdded": datetime.now(tz=timezone.utc).isoformat(),
        "title": detail.get("Title"),
        "year": year,
        "director": detail.get("Director", "Unknown"),
        "genre": (
            [g.strip() for g in detail.get("Genre", "").split(",")]
            if detail.get("Genre")
            else []
        ),
        "plot": detail.get("Plot"),
        "imdbId": detail.get("imdbID"),
        "runtime": detail.get("Runtime"),
        "imdbRating": detail.get("imdbRating"),
        "imageUrl": poster,
        "rating": req.rating,
        "notes": req.notes,
        "tags": req.tags,
        "format": req.format,
        "audioQuality": req.audioQuality,
        "purchasedAt": req.purchasedAt,
        "watched": req.watched,
    }

    movies.append(new_movie)
    save_db(movies)
    return success(new_movie)


@app.put("/api/collections/movies/{id}")
def update_movie(id: str, payload: dict):

    movies = load_db()

    for m in movies:
        if m.get("id") == id:
            for k, v in payload.items():

                if v is not None:
                    m[k] = v

            save_db(movies)
            return success(m)

    return error("Movie not found")


@app.delete("/api/collections/movies/{id}")
def delete_movie(id: str):

    movies = load_db()
    filtered = [m for m in movies if m.get("id") != id]

    if len(filtered) == len(movies):
        return error("Movie not found")

    save_db(filtered)
    return success({"deleted": True})


if __name__ == "__main__":

    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
