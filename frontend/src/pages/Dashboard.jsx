import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle"); 
  // idle | queued | error

  const [attempts, setAttempts] = useState(0);
  const pollingRef = useRef(null);

  /* ---------------- START MATCH ---------------- */

  const startMatch = async () => {
    setStatus("idle");
    setAttempts(0);

    try {
      const res = await api.post("/match/start", {
        userId: user.id,
      });

      // Player 1
      if (res.data.status === "queued") {
        setStatus("queued");
        startPolling();
      }

      // Player 2
      if (res.data.status === "matched") {
        navigate(`/match/${res.data.matchId}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  /* ---------------- POLLING ---------------- */

  const startPolling = () => {
  if (pollingRef.current) return;

  pollingRef.current = setInterval(async () => {
    try {
      setAttempts((a) => a + 1);

      const res = await api.get(`/match/active/${user.id}`);

      if (res.data.match?.matchId) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        navigate(`/match/${res.data.match.matchId}`);
      }
    } catch (err) {
      console.error("Polling failed");
    }
  }, 3000);
};

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  /* ---------------- WAITING UI ---------------- */

  if (status === "queued") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow w-96 text-center space-y-2">
          <h2 className="text-xl font-bold">Matchmaking</h2>
          <p className="text-blue-600">Waiting for opponent…</p>
          <p className="text-sm text-gray-500">
            Attempts: {attempts}
          </p>
          <p className="text-xs text-gray-400">
            Do not refresh this page
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96 space-y-4 text-center">
        <h2 className="text-xl font-bold">Dashboard</h2>

        <p>
          Welcome,{" "}
          <span className="font-semibold">{user.username}</span>
        </p>

        <p className="text-sm text-gray-500">
          Rating: {user.rating}
        </p>

        {status === "error" && (
          <p className="text-red-500 text-sm">
            Failed to start matchmaking
          </p>
        )}

        <button
          onClick={startMatch}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Find Match
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