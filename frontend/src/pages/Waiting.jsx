import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL = 3000; // 3 seconds

const Waiting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Waiting for opponent...");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!user) return;

    const poll = async () => {
      try {
        const res = await api.post("/match/start", {
          userId: user.id,
        });

        if (res.data.status === "matched") {
          navigate(`/match/${res.data.match._id}`);
        } else {
          setAttempts((prev) => prev + 1);
        }
      } catch (err) {
        setStatus("Error while checking match status");
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL);
    poll();

    return () => clearInterval(interval);
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96 text-center space-y-4">
        <h2 className="text-xl font-bold">Matchmaking</h2>

        <p className="text-blue-600">{status}</p>

        <p className="text-sm text-gray-500">Attempts: {attempts}</p>

        <p className="text-xs text-gray-400">Do not refresh this page</p>
      </div>
    </div>
  );
};

export default Waiting;
