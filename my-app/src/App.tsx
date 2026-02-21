import { useEffect } from "react";
// import { Link } from "react-router-dom";
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
import addEntry from "./addEntry";

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
  }, []);
  return (
    <>
      <div className="gallery">
        <img src={backgroundImage} className="background"></img>
      </div>
      <div className="sprite-container">
        <canvas id="sprite"></canvas>
      </div>
      <div className="button-container">
        {/* <Link to="/addEntry"> */}
        <button className="button">+</button>
        {/* </Link> */}
        <button className="button">Save</button>
        <button className="button">Load</button>
        <button className="button" onClick={showModal}>
          Detail Modal Test
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
      {/* <Modal className="details" show={modalVisible} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Movie title here</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Date acquired: </h3>
          <h3>Format: </h3>
          <h3>Audio quality: </h3>
          <h3>Last watched: never</h3>
        </Modal.Body>
      </Modal> */}

      <Modal show={modalVisible} onHide={hideModal}>
        <Modal.Header>
          <Modal.Title>Movie Entry Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form action="" method="post" className="entry-form">
            <div className="entry-attribute">
              <label>Date acquired: </label>
              <input type="text" name="acquired" id="acquired"></input>
            </div>
            <div className="entry-attribute">
              <label>Format: </label>
              <input type="text" name="format" id="format"></input>
            </div>
            <div className="entry-attribute">
              <label>Audio quality: </label>
              <input type="text" name="audioQuality" id="audioQuality"></input>
            </div>
            <div className="entry-attribute">
              <label>Date last watched: </label>
              <input type="text" name="lastWatched" id="lastWatched"></input>
            </div>
            <div className="entry-attribute">
              <label>Rating: </label>
              <input type="text" name="rating" id="rating"></input>
            </div>
            <div className="entry-attribute">
              <label>Notes: </label>
              <input type="text" name="notes" id="notes"></input>
            </div>
            <div className="buttons">
              <button onClick={hideModal}>Cancel</button>
              <button onClick={hideModal}>Submit</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;
