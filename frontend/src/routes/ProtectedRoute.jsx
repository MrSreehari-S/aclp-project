import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto relative">
            <div className="absolute inset-0 border-4 border-purple-300/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-purple-400 border-r-pink-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-purple-200 text-sm font-medium">Restoring session...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
