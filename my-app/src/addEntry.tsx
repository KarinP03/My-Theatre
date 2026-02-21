import { Link } from "react-router-dom";
import "./App.css";
import { useState } from "react";
import { Modal } from "react-bootstrap";

function addEntry() {
  const [modalVisible, setModalVisible] = useState(false);
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  return (
    <>
      <Modal>
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
          </div>{" "}
          <button onClick={hideModal}>Cancel</button>
          <button onClick={hideModal}>Submit</button>
        </form>
      </Modal>
    </>
  );
}

export default addEntry;
