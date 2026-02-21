# Collection Manager API

A Python backend for managing a personal media collection, backed by a simple `movies.json` file.

## Installation

1. Ensure [uv](https://github.com/astral-sh/uv) is installed on your system.
2. Navigate to the `api` directory:
   ```bash
   cd api
   ```
3. (Optional) Sync the project dependencies:
   ```bash
   uv sync
   ```
   _Note: `uv run` will automatically install dependencies and create the `.venv` if they aren't present._

## Running the App

Start the server by running:

```bash
uv run main.py
```

The API will start on `http://0.0.0.0:8000` (or the port specified in your `PORT` environment variable).

## Global Response Envelope

Every endpoint (success or failure) returns a predictable JSON structure.

### Success Envelope

```json
{
  "success": true,
  "data": { ... }, // Or an Array []
  "total": 1 // Optional, usually attached to list responses
}
```

### Error Envelope

```json
{
  "success": false,
  "data": null,
  "error": "Message describing the error"
}
```

---

## The `Movie` Object

When `data` contains a movie, it looks like this:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "collectionType": "movie",
  "era": "modern",
  "dateAdded": "2026-02-21T06:00:00.000000+00:00",
  "title": "Inception",
  "year": 2010,
  "director": "Christopher Nolan",
  "genre": ["Action", "Sci-Fi"],
  "plot": "A thief who steals corporate secrets...",
  "imdbId": "tt1375666",
  "runtime": "148 min",
  "imdbRating": "8.8",
  "imageUrl": "https://m.media-amazon.com/images/M/...jpg",
  "rating": 10,
  "notes": "Favorite movie",
  "tags": ["favorite", "nolan"],
  "format": "4K UHD",
  "audioQuality": "Dolby Atmos",
  "purchasedAt": "2026-02-21",
  "watched": true
}
```

---

## Endpoints

### `GET /api/collections/movies`

List all movies in the collection.

- **Expected Output**: Success Envelope where `data` is an array of `Movie` objects.

### `GET /api/collections/movies/search?q={query}`

Search the local collection by title, director, imdbId, genre, or tags.

- **Expected Output**: Success Envelope where `data` is an array of matching `Movie` objects.

### `GET /api/collections/movies/{id}`

Retrieve a specific movie by its internal tracking UUID.

- **Expected Output**: Success Envelope where `data` is a single `Movie` object. Returns an Error Envelope if not found.

### `GET /api/collections/movies/lookup?q={query}&p={page}`

Ping the external OMDB API to search for movies to add. Does not save to the database.

- `q`: Search query string.
- `p`: (Optional) Page number for pagination, defaults to 1.

- **Expected Output**: Success Envelope where `data` is an array of OMDB lightweight search results:

```json
{
  "success": true,
  "data": [
    {
      "Title": "Inception",
      "Year": "2010",
      "imdbID": "tt1375666",
      "Type": "movie",
      "Poster": "https://..."
    }
  ],
  "total": 1
}
```

### `POST /api/collections/movies/add`

Fetch full movie details from OMDB by `imdbId` and save it to the local collection.

- **Body**:

```json
{
  "imdbId": "tt1375666",
  "rating": 10, // Optional
  "tags": ["Action"], // Optional
  "notes": "Great!", // Optional
  "format": "4K UHD", // Optional — "4K UHD", "Blu-ray", "DVD"
  "audioQuality": "Dolby Atmos", // Optional
  "purchasedAt": "2026-02-21", // Optional — ISO date string
  "watched": false // Optional — defaults to false
}
```

- **Expected Output**: Success Envelope where `data` is the newly created `Movie` object.

### `POST /api/collections/movies`

Manually add a movie circumventing OMDB entirely.

- **Body**:

```json
{
  "title": "My Custom Movie",
  "year": 2026,
  "director": "Me", // Optional
  "genre": ["Drama"],
  "plot": "...", // Optional
  "runtime": "...", // Optional
  "imageUrl": "...", // Optional
  "rating": 8, // Optional
  "tags": [], // Optional
  "notes": "...", // Optional
  "format": "Blu-ray", // Optional — "4K UHD", "Blu-ray", "DVD"
  "audioQuality": "DTS-HD MA 7.1", // Optional
  "purchasedAt": "2026-02-21", // Optional — ISO date string
  "watched": false // Optional — defaults to false
}
```

- **Expected Output**: Success Envelope where `data` is the newly created `Movie` object.

### `PUT /api/collections/movies/{id}`

Partially update an existing movie.

- **Body**: Any subset of the manual addition payload (e.g., `{"rating": 5}`).
- **Expected Output**: Success Envelope where `data` is the fully updated `Movie` object. Returns an Error Envelope if not found.

### `DELETE /api/collections/movies/{id}`

Remove a movie from the local collection.

- **Expected Output**:

```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "total": null
}
```
