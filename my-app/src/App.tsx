import { Link } from "react-router-dom";
import backgroundImage from "../../2d-assets/background/Background3.png";
import sprite from "../../2d-assets/sprite/walk2.png";
import "./App.css";
// import detailsModal from "./detailsModal.tsx";
import { useState } from "react";
import Modal from "react-bootstrap/Modal";

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  return (
    <>
      <div className="gallery">
        <img src={backgroundImage} className="background"></img>
      </div>
      <div>
        <img src={sprite} className="sprite"></img>
      </div>
      <div className="button-container">
        <Link to="/addEntry">
          <button className="button">+</button>
        </Link>
        <button className="button" onClick={showModal}>
          Save
        </button>
        <button className="button">Load</button>
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
