import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { surfaceForLocation } from "./surface";
import "./styles.css";
const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
if (
  root.hasChildNodes() &&
  surfaceForLocation(location.pathname, location.hash) === "homepage"
)
  hydrateRoot(root, app);
else createRoot(root).render(app);
