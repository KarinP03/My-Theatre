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

  // Expanded plots (by imdbID)
  const [expandedPlots, setExpandedPlots] = useState<Record<string, string>>(
    {}
  );
  const [loadingPlots, setLoadingPlots] = useState<Record<string, boolean>>({});

  // Confirmation modal
  const [selectedMovie, setSelectedMovie] = useState<OmdbFullResult | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live search (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (title.trim().length < 2) {
      setLiveResults([]);
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

  const togglePlot = async (movie: OmdbSearchResult) => {
    const id = movie.imdbID;

    if (expandedPlots[id] !== undefined) {
      setExpandedPlots((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    // Fetch plot
    setLoadingPlots((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await apiFetch(
        `/api/collections/movies/lookup/title?title=${encodeURIComponent(
          movie.Title
        )}&year=${encodeURIComponent(movie.Year)}`
      );
      const json: LookupByTitleResponse = await res.json();
      if (json.success && json.data) {
        setExpandedPlots((prev) => ({
          ...prev,
          [id]: json.data!.Plot || "No plot available.",
        }));
      } else {
        setExpandedPlots((prev) => ({
          ...prev,
          [id]: "Plot not available.",
        }));
      }
    } catch {
      setExpandedPlots((prev) => ({
        ...prev,
        [id]: "Failed to load plot.",
      }));
    } finally {
      setLoadingPlots((prev) => ({ ...prev, [id]: false }));
    }
  };

  const openConfirm = async (movie: OmdbSearchResult) => {
    setConfirmLoading(true);
    setSelectedMovie(null);
    setAddSuccess(false);

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
    } catch {}
    
    finally {
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
        body: JSON.stringify({ imdbId: selectedMovie.imdbID }),
      });
      setAddSuccess(true);
      setTimeout(() => {
        setSelectedMovie(null);
        setAddSuccess(false);
        setTitle("");
        setYear("");
        setLiveResults([]);
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
                  <button
                    className="result-plot-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlot(movie);
                    }}
                  >
                    {loadingPlots[movie.imdbID]
                      ? "Loading…"
                      : expandedPlots[movie.imdbID] !== undefined
                        ? "▾ Hide plot"
                        : "▸ Show plot"}
                  </button>
                </div>

                <span className="result-arrow">›</span>
              </div>

              {expandedPlots[movie.imdbID] !== undefined && (
                <p className="result-plot">{expandedPlots[movie.imdbID]}</p>
              )}
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
                    {selectedMovie.Actors && (
                      <p className="confirm-sub">
                        Cast: {selectedMovie.Actors}
                      </p>
                    )}
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
                  <p className="confirm-plot">{selectedMovie.Plot}</p>
                )}

                <hr className="confirm-divider" />

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
