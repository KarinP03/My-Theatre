import { useEffect } from "react";
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
// import detailsModal from "./detailsModal.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { move } from "./frameAnimation";

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  useEffect(() => {
    // React has finished rendering, so the element now exists in the DOM
    draw(walkr1, walkr2, walkr3, walkl1, walkl2, walkl3);
  }, []);
  useEffect(() => {
    move();
  }, [])
  return (
    <>
      <div className="gallery">
        <img src={backgroundImage} className="background"></img>
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
        <button className="button" onClick={showModal}>
          Modal test
        </button>
      </div>
      <div className="poster-container">
        <img src={poster} className="poster" onClick={showModal}></img>
        <img src={poster} className="poster" onClick={showModal}></img>
        <img src={poster} className="poster" onClick={showModal}></img>
        <img src={poster} className="poster" onClick={showModal}></img>
        <img src={poster} className="poster" onClick={showModal}></img>
        <img src={poster} className="poster" onClick={showModal}></img>
      </div>
      <Modal className="details" show={modalVisible} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Movie title here</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Date acquired: </h3>
          <h3>Format: </h3>
          <h3>Audio quality: </h3>
          <h3>Last watched: never</h3>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;
