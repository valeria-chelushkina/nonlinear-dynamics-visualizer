import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import SimulationPage from "@/pages/SimulationPage";
import Library from "@/pages/Library";
import UserLibrary from "@/pages/UserLibrary";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ChangePassword from "@/pages/ChangePassword";
import Header from "@/components/ui/Header";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";
import { useSimulationStore } from "@/stores/useSimulationStore";
import "@/styles/App.css";

const NavigationWatcher = () => {
  const location = useLocation();
  const setIsLoading = useUIStore((state) => state.setIsLoading);

  useEffect(() => {
    // Show loader on navigation
    setIsLoading(true);
    
    // Hide after a small delay to allow for page mounting
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname, setIsLoading]);

  return null;
};

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const isLoading = useUIStore((state) => state.isLoading);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <NavigationWatcher />
      {isLoading && <LoadingScreen />}
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1, position: "relative", overflowY: "auto" }}>
          <Routes>
            {/* Lorenz simulation - is default for this project, so we navigate to it when starting the website. */}
            <Route path="/" element={<Navigate to="/sim/lorenz" replace />} />
            <Route path="/sim/:id" element={<SimulationPage />} />
            <Route path="/library" element={<Library />} />
            <Route path="/user/:userId" element={<UserLibrary />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
