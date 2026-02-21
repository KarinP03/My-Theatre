import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import backgroundImage from "../../2d-assets/background/Background3.png";
import poster from "../../2d-assets/poster/poster-border-no-fill.png";
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

function App() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

    const handleShowModal = (movie: any) => {
        setSelectedMovie(movie);
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
        setSelectedMovie(null);
    };

    useEffect(() => {
        draw(walkr1, walkr2, walkr3, walkl1, walkl2, walkl3);
    }, []);

    useEffect(() => {
        move();
    }, []);

    const [movies, setMovies] = useState<any[]>([]);

    useEffect(() => {
        const searchMovies = async () => {
            try {
                const response = await fetch("http://0.0.0.0:8000/api/collections/movies");
                const result = await response.json();

                if (result.success && result.data) {
                    setMovies(result.data);
                } else {
                    setMovies(result);
                }
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };

        searchMovies();
    }, []);

    return (
        <>
            <div className="gallery">
                <img src={backgroundImage} className="background" alt="bg" />
            </div>
            <div className="sprite-container">
                <canvas id="sprite"></canvas>
            </div>
            <div className="button-container">
                <Link to="/addEntry">
                    <button className="button">+</button>
                </Link>
                <button className="button">Save</button>
                <button className="button">Load</button>
            </div>
            <div className="poster-container">
                {movies.map((movie) => (
                    <img
                        key={movie.id}
                        src={movie.imageUrl}
                        className="poster"
                        onClick={() => handleShowModal(movie)}
                        alt="poster"
                    />
                ))}
            </div>

            <Modal className="details" show={modalVisible} onHide={hideModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedMovie?.title || "Movie Details"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h3>Rating: {selectedMovie?.rating || "N/A"}</h3>
                    <h3>Tags: {selectedMovie?.tags?.join(", ") || "None"}</h3>
                    <h3>Notes: {selectedMovie?.notes || "No notes"}</h3>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default App;
