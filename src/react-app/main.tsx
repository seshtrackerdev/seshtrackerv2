import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/.css";
import App from "./App.tsx";
import { AuthProvider } from "./hooks/useAuth";
import { SessionProvider, InventoryProvider } from "./contexts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SessionProvider>
        <InventoryProvider>
          <App />
        </InventoryProvider>
      </SessionProvider>
    </AuthProvider>
  </StrictMode>,
);

