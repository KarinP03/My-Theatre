import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import AddEntry from "./addEntry.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<App />}></Route>
        <Route path="/addEntry" element={<AddEntry />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
