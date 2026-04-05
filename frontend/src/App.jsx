import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Match from "./pages/Match";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import MatchHistory from "./pages/MatchHistory";
import Leaderboard from "./pages/Leaderboard";
import MatchSummary from "./pages/MatchSummary";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/match/:matchId"
          element={
            <ProtectedRoute>
              <Match />
            </ProtectedRoute>
          }
        />

        {/* ✅ ADD SUMMARY ROUTE HERE */}
        <Route
          path="/match/:matchId/summary"
          element={
            <ProtectedRoute>
              <MatchSummary />
            </ProtectedRoute>
          }
        />

        <Route path="/history" element={<MatchHistory />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;