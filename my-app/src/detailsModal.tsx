import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import { ModalBody } from "react-bootstrap";

function modal() {
  const [visible, setVisible] = useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return;
  <>
    <Modal show={visible}>
      <Modal.Header closeButton>
        <Modal.Title>Movie title here</Modal.Title>
      </Modal.Header>
      <ModalBody>
        <h3>Date acquired: </h3>
        <h3>Format: </h3>
        <h3>Audio quality: </h3>
        <h3>Last watched: never</h3>
      </ModalBody>
    </Modal>
  </>;
}

export default modal;
