import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "./utils/api";
import "./App.css";

// ── Types ──────────────────────────────────────────────────────────

type ApiResponse<T> =
  | { success: true; data: T; total?: number }
  | { success: false; data: null; error: string };

type OmdbSearchResult = {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Plot?: string; // now included in eager fetch
};

type OmdbFullResult = {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
};

type LookupResponse = ApiResponse<OmdbSearchResult[]>;
type LookupByTitleResponse = ApiResponse<OmdbFullResult | null>;


function AddEntry() {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");

  // Live keyword search
  const [liveResults, setLiveResults] = useState<OmdbSearchResult[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  // Confirmation modal
  const [selectedMovie, setSelectedMovie] = useState<OmdbFullResult | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Physical Collection Fields
  const [format, setFormat] = useState("");
  const [audioQuality, setAudioQuality] = useState("");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [purchasedAt, setPurchasedAt] = useState("");
  const [watched, setWatched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live search (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (title.trim().length < 2) {
      // setLiveResults([]); // Ensure results clear if title is too short
      return;
    }

    setLiveLoading(true);

    debounceRef.current = setTimeout(() => {
      (async () => {
        try {
          let url = `/api/collections/movies/lookup?q=${encodeURIComponent(
            title.trim()
          )}`;
          if (year.trim()) {
            url += `&y=${encodeURIComponent(year.trim())}`;
          }
          const res = await apiFetch(url);
          const json: LookupResponse = await res.json();
          if (json.success) {
            setLiveResults(json.data ?? []);
          } else {
            setLiveResults([]);
          }
        } catch {
          setLiveResults([]);
        } finally {
          setLiveLoading(false);
        }
      })();
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, year]);

  const openConfirm = async (movie: OmdbSearchResult) => {
    setConfirmLoading(true);
    setSelectedMovie(null);
    setAddSuccess(false);

    // Reset inputs
    setFormat("");
    setAudioQuality("");
    setRating("");
    setNotes("");
    setPurchasedAt("");
    setWatched(false);

    try {
      const res = await apiFetch(
        `/api/collections/movies/lookup/title?title=${encodeURIComponent(
          movie.Title
        )}&year=${encodeURIComponent(movie.Year)}`
      );
      const json: LookupByTitleResponse = await res.json();
      if (json.success && json.data) {
        setSelectedMovie(json.data);
      }
    } catch {
      /* silently fail */
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedMovie) return;
    setAddLoading(true);
    try {
      await apiFetch("/api/collections/movies/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imdbId: selectedMovie.imdbID,
          format: format || undefined,
          audioQuality: audioQuality || undefined,
          rating: rating ? Number(rating) : undefined,
          notes: notes || undefined,
          purchasedAt: purchasedAt || undefined,
          watched: watched
        }),
      });
      setAddSuccess(true);
      setTimeout(() => {
        setSelectedMovie(null);
        setAddSuccess(false);
        // setTitle("");
        // setYear("");
        // setLiveResults([]);
      }, 1200);
    } catch {
      /* silently fail */
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="search-bar glass">
        <svg
          className="search-bar-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-bar-input"
          type="text"
          placeholder="Search for a movie…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <input
          className="search-bar-year"
          type="text"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        {liveLoading && <span className="search-bar-spinner" />}
      </div>

      <Link to="/" className="search-back-link">
        ← Back
      </Link>

      {liveResults.length > 0 && (
        <div className="search-results glass">
          {liveResults.map((movie) => (
            <div key={movie.imdbID} className="result-card">
              <div
                className="result-card-main"
                onClick={() => openConfirm(movie)}
              >
                {movie.Poster && movie.Poster !== "N/A" ? (
                  <img
                    src={movie.Poster}
                    alt={movie.Title}
                    className="result-poster"
                  />
                ) : (
                  <div className="result-poster result-poster--empty">
                    <span>N/A</span>
                  </div>
                )}

                <div className="result-info">
                  <p className="result-title">{movie.Title}</p>
                  <p className="result-year">{movie.Year}</p>
                  {movie.Plot && (
                    <p className="result-plot" style={{ padding: '8px 0 0 0', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {movie.Plot}
                    </p>
                  )}
                </div>

                <span className="result-arrow">›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!liveLoading &&
        liveResults.length === 0 &&
        title.trim().length >= 2 && (
          <p className="search-empty">No results found.</p>
        )}

      {confirmLoading && (
        <div className="confirm-overlay">
          <div className="confirm-loading-card glass">
            <span className="search-bar-spinner" />
            <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
              Fetching details…
            </p>
          </div>
        </div>
      )}

      {/*Confirmation Modal */}
      {selectedMovie && !confirmLoading && (
        <div
          className="confirm-overlay"
          onClick={() => {
            if (!addLoading) {
              setSelectedMovie(null);
              setAddSuccess(false);
            }
          }}
        >
          <div
            className="confirm-modal glass"
            onClick={(e) => e.stopPropagation()}
          >
            {addSuccess ? (
              <div className="confirm-success">
                <span className="confirm-success-check">✓</span>
                <p>Added to collection!</p>
              </div>
            ) : (
              <>
                <div className="confirm-header">
                  {selectedMovie.Poster &&
                    selectedMovie.Poster !== "N/A" ? (
                    <img
                      src={selectedMovie.Poster}
                      alt={selectedMovie.Title}
                      className="confirm-poster"
                    />
                  ) : null}
                  <div className="confirm-meta">
                    <h3 className="confirm-title">{selectedMovie.Title}</h3>
                    <p className="confirm-sub">
                      {selectedMovie.Year} · {selectedMovie.Runtime} ·{" "}
                      {selectedMovie.Genre}
                    </p>
                    <p className="confirm-sub">
                      Directed by {selectedMovie.Director}
                    </p>
                    {selectedMovie.imdbRating && (
                      <p className="confirm-rating">
                        ⭐ {selectedMovie.imdbRating}/10
                        <span className="confirm-votes">
                          ({selectedMovie.imdbVotes} votes)
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {selectedMovie.Plot && (
                  <p className="confirm-plot" style={{ marginBottom: 12 }}>{selectedMovie.Plot}</p>
                )}

                <hr className="confirm-divider" />

                {/* Collection Fields */}
                <div className="confirm-fields" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>Collection Details</h4>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label className="confirm-label" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                      Format
                      <input type="text" value={format} onChange={e => setFormat(e.target.value)} placeholder="e.g. 4K Blu-ray, DVD" className="confirm-input" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', color: '#fff', outline: 'none' }} />
                    </label>
                    <label className="confirm-label" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                      Audio Quality
                      <input type="text" value={audioQuality} onChange={e => setAudioQuality(e.target.value)} placeholder="e.g. Dolby Atmos" className="confirm-input" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', color: '#fff', outline: 'none' }} />
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label className="confirm-label" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                      Date Acquired
                      <input type="date" value={purchasedAt} onChange={e => setPurchasedAt(e.target.value)} className="confirm-input" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                    </label>
                    <label className="confirm-label" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                      Your Rating (1-10)
                      <input type="number" min="1" max="10" value={rating} onChange={e => setRating(e.target.value)} placeholder="e.g. 9" className="confirm-input" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', color: '#fff', outline: 'none' }} />
                    </label>
                  </div>
                  <label className="confirm-label" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                    Notes / Location
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Shelf 3, Steelbook..." className="confirm-input confirm-textarea" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', color: '#fff', outline: 'none', minHeight: '60px', resize: 'vertical' }} />
                  </label>
                  <label className="confirm-label confirm-label--row" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: '#fff', cursor: 'pointer', marginTop: '4px' }}>
                    <input type="checkbox" checked={watched} onChange={e => setWatched(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#4facfe', cursor: 'pointer' }} />
                    Mark as watched
                  </label>
                </div>

                <hr className="confirm-divider" style={{ marginTop: 'auto' }} />

                <div className="confirm-actions">
                  <button
                    className="confirm-btn confirm-btn--cancel"
                    onClick={() => {
                      setSelectedMovie(null);
                      setAddSuccess(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-btn confirm-btn--add"
                    onClick={handleAdd}
                    disabled={addLoading}
                  >
                    {addLoading ? "Adding…" : "Add to Collection"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AddEntry;
