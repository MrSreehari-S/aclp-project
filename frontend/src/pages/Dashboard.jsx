import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center">
          Welcome, {user.username}
        </h1>

        <p className="text-center text-gray-600">
          Rating: <span className="font-semibold">{user.rating}</span>
        </p>

        <button
          onClick={() => navigate("/matchmaking")}
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Start Match
        </button>

        <button
          onClick={() => navigate("/history")}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Match History
        </button>

        <button
          onClick={logout}
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
