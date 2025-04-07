import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Import core styles first
import "./styles/variables.css";
import "./styles/themes.css";
import "./styles/reset.css";
import "./styles/typography.css";
import "./styles/utilities.css";
import "./styles/base.css";

// Then component-specific styles from styles directory
import "./styles/App.css";
import "./styles/Header.css";
import "./styles/LandingPage.css";
import "./styles/Auth.css";
import "./styles/Dashboard.css"; 
import "./styles/SettingsMenu.css";
import "./styles/Modal.css";
import "./styles/Tabs.css";
import "./styles/Button.css";
import "./styles/Card.css";
import "./styles/Badge.css";
import "./styles/Input.css";
import "./styles/Toggle.css";
import "./styles/ThemeToggle.css";
import "./styles/ComponentShowcase.css";
import "./styles/RadarChart.css";
import "./styles/RatingSlider.css";
import "./styles/TagSelector.css";
import "./styles/TimelineChart.css";
import "./styles/BarChart.css";
import "./styles/TrendChart.css";

// Import component-specific styles directly from their locations
import "./components/landing/LandingPage.css";
import "./components/ui/Button/Button.css";
import "./components/ui/Card/Card.css";
import "./components/ui/Toggle/Toggle.css";
import "./components/ui/Text/Text.css";
import "./components/ui/Input/Input.css";

// Finally import components
import App from "./App.tsx";
import { AuthProvider } from "./hooks/useAuth";
import { SessionProvider, InventoryProvider } from "./contexts/index.ts";

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

