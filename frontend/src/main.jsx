import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";

// Current active Google OAuth Client ID ("FuturePlay Web Client" - project futureplay-461207)
const CURRENT_GOOGLE_CLIENT_ID =
  "590767155641-ikejvmm3i0e0gft4ic38u2l86joj925e.apps.googleusercontent.com";

const getGoogleClientId = () => {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  if (!envClientId || envClientId.includes("79973044898")) {
    return CURRENT_GOOGLE_CLIENT_ID;
  }
  return envClientId;
};

const GOOGLE_CLIENT_ID = getGoogleClientId();

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
