import httpx
import asyncio
import json


async def run_tests():
    BASE_URL = "http://127.0.0.1:8000"

    async with httpx.AsyncClient() as client:
        # 1. Test Health
        r = await client.get(f"{BASE_URL}/api/health")
        print("Health Check:", json.dumps(r.json(), indent=2))
        assert r.json()["success"] is True

        # 2. Add Movie Manually
        manual_data = {
            "title": "Test FastAPI Movie",
            "year": 2026,
            "director": "uv developer",
            "genre": ["Sci-Fi"],
            "rating": 9,
        }
        r = await client.post(f"{BASE_URL}/api/collections/movies", json=manual_data)
        print("Manual Add:", json.dumps(r.json(), indent=2))
        assert r.json()["success"] is True
        movie_id = r.json()["data"]["id"]

        # 3. Get Movie
        r = await client.get(f"{BASE_URL}/api/collections/movies/{movie_id}")
        assert r.json()["success"] is True
        assert r.json()["data"]["title"] == "Test FastAPI Movie"

        # 4. Search Movies
        r = await client.get(f"{BASE_URL}/api/collections/movies/search?q=FastAPI")
        print("Search Result:", json.dumps(r.json(), indent=2))
        assert r.json()["success"] is True
        assert len(r.json()["data"]) > 0

        # 5. Delete Movie
        r = await client.delete(f"{BASE_URL}/api/collections/movies/{movie_id}")
        assert r.json()["success"] is True
        assert r.json()["data"]["deleted"] is True

        # === 6. Real OMDB Testing ===
        # Note: You must have OMDB_API_KEY exported in your environment or .env for this to succeed!
        print("\n--- Testing Real OMDB Endpoints ---")
        # 6a. Lookup
        r = await client.get(f"{BASE_URL}/api/collections/movies/lookup?q=Inception")
        print("OMDB Lookup:", json.dumps(r.json(), indent=2))
        assert r.json()["success"] is True

        if len(r.json()["data"]) > 0:
            target_imdb_id = r.json()["data"][0]["imdbID"]

            # 6b. Add via OMDB
            add_omdb_req = {
                "imdbId": target_imdb_id,
                "rating": 10,
                "tags": ["favorite", "nolan"],
            }
            r = await client.post(
                f"{BASE_URL}/api/collections/movies/add", json=add_omdb_req
            )
            print("OMDB Add:", json.dumps(r.json(), indent=2))
            assert r.json()["success"] is True
            omdb_movie_id = r.json()["data"]["id"]

            # 6c. Cleanup the OMDB addition
            await client.delete(f"{BASE_URL}/api/collections/movies/{omdb_movie_id}")
        else:
            print("OMDB Lookup returned no data (Is your API key set?)")

        print("\nAll endpoints working and returning strict SuccessResponse contracts.")


if __name__ == "__main__":
    asyncio.run(run_tests())
