import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
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
import "@/styles/App.css";

function App() {
  return (
    <BrowserRouter>
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
