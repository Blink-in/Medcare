import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";
import useAuthStore from "./store/authStore";

const AppInitializer = () => {
  const getMe = useAuthStore((state) => state.getMe);

  useEffect(() => {
    getMe();
  }, [getMe]);

  return <App />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppInitializer />
  </StrictMode>
);