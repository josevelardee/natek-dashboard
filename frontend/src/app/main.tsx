import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "../assets/styles/index.css";
import App from "./App";
import { UserProvider } from "../context/UserContext"; 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter basename="/natek-dashboard/">
        <App />
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
);