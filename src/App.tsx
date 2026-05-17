import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SimulationPage from "@/pages/SimulationPage";
import Library from "@/pages/Library";
import UserLibrary from "@/pages/UserLibrary";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Header from "@/components/ui/Header";
import "@/styles/App.css";

function App() {
  return (
    <Router>
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1, position: "relative", overflowY: "auto" }}>
          <Routes>
            {/* Redirect root to lorenz simulation */}
            <Route path="/" element={<Navigate to="/sim/lorenz" replace />} />

            {/* Dynamic simulation route */}
            <Route path="/sim/:id" element={<SimulationPage />} />

            <Route path="/library" element={<Library />} />
            <Route path="/user/:userId" element={<UserLibrary />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
