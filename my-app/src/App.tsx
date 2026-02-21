import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import backgroundImage from "../../2d-assets/background/Background3.png";
import posterFrame from "../../2d-assets/poster/poster-border-no-fill.png";
import walkl1 from "../../2d-assets/sprite/LeftWalk1.png";
import walkl2 from "../../2d-assets/sprite/LeftWalk2.png";
import walkl3 from "../../2d-assets/sprite/LeftWalk3.png";
import walkr1 from "../../2d-assets/sprite/RightWalk1.png";
import walkr2 from "../../2d-assets/sprite/RightWalk2.png";
import walkr3 from "../../2d-assets/sprite/RightWalk3.png";
import { draw } from "./animation";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import { move } from "./frameAnimation";
import { apiFetch } from "./utils/api";

type Movie = {
  id: string;
  title: string;
  year: number;
  director: string;
  genre: string[];
  plot: string | null;
  runtime: string | null;
  imageUrl: string | null;
  imdbRating: string | null;
  imdbId?: string;
  rating: number | null;
  notes: string | null;
  tags: string[];
  era: string;
  dateAdded: string;
  format: string | null;
  audioQuality: string | null;
  purchasedAt: string | null;
  watched: boolean;
};

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openDetails = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  };
  const hideModal = () => {
    setModalVisible(false);
    setSelectedMovie(null);
  };

  // Fetch movie collection on launch
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/collections/movies");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMovies(json.data);
        }
      } catch {
        console.error("Failed to load movie collection");
      }
    })();
  }, []);

  // Sprite animation
  useEffect(() => {
    draw(walkr1, walkr2, walkr3, walkl1, walkl2, walkl3);
  }, []);

  useEffect(() => {
    move();
  }, []);

  return (
    <>
      <div
        className="gallery"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="sprite-container">
        <canvas id="sprite"></canvas>
      </div>
      <div className="button-container">
        <Link to="/addEntry">
          <button className="button">+</button>
        </Link>
      </div>
      <div className="poster-container">
        {movies.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.4)", margin: "auto" }}>
            No movies yet — click + to add one!
          </p>
        )}
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="poster-wrapper"
            onClick={() => openDetails(movie)}
          >
            <img src={posterFrame} className="poster" />
            {movie.imageUrl && (
              <img
                src={movie.imageUrl}
                alt={movie.title}
                className="poster-art"
              />
            )}
            <span className="poster-label">{movie.title}</span>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      <Modal className="details" show={modalVisible} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedMovie?.title ?? "Movie Details"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMovie && (
            <>
              {selectedMovie.imageUrl && (
                <img
                  src={selectedMovie.imageUrl}
                  alt={selectedMovie.title}
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
              )}
              <h5>
                {selectedMovie.title} ({selectedMovie.year})
              </h5>
              <p>
                <strong>Director:</strong> {selectedMovie.director}
              </p>
              <p>
                <strong>Genre:</strong> {selectedMovie.genre.join(", ")}
              </p>
              {selectedMovie.runtime && (
                <p>
                  <strong>Runtime:</strong> {selectedMovie.runtime}
                </p>
              )}
              {selectedMovie.imdbRating && (
                <p>
                  <strong>IMDb Rating:</strong> ⭐ {selectedMovie.imdbRating}/10
                </p>
              )}
              {selectedMovie.plot && (
                <p>
                  <strong>Plot:</strong> {selectedMovie.plot}
                </p>
              )}
              <hr />
              <p>
                <strong>Era:</strong> {selectedMovie.era}
              </p>
              <p>
                <strong>Date added:</strong>{" "}
                {new Date(selectedMovie.dateAdded).toLocaleDateString()}
              </p>
              {selectedMovie.format && (
                <p>
                  <strong>Format:</strong> {selectedMovie.format}
                </p>
              )}
              {selectedMovie.audioQuality && (
                <p>
                  <strong>Audio quality:</strong> {selectedMovie.audioQuality}
                </p>
              )}
              <p>
                <strong>Watched:</strong>{" "}
                {selectedMovie.watched ? "Yes" : "Not yet"}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;

