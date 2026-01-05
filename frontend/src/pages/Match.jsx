import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MatchPage = () => {
  const { matchId } = useParams();
  const { user } = useAuth();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/match/${matchId}`);
        setMatch(res.data);
      } catch (err) {
        setError("Failed to load match");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading match...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const { players, problem, status } = match;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Match Header */}
        <div className="bg-white p-4 rounded shadow flex justify-between items-center">
          <h2 className="text-xl font-bold">Match #{matchId}</h2>
          <span className="text-sm text-gray-600">
            Status: <strong>{status}</strong>
          </span>
        </div>

        {/* Players */}
        <div className="grid grid-cols-2 gap-4">
          {players.map((p) => (
            <div
              key={p.userId}
              className={`bg-white p-4 rounded shadow ${
                p.userId === user.id ? "border-2 border-blue-500" : ""
              }`}
            >
              <h3 className="font-semibold">{p.username}</h3>
              <p className="text-sm text-gray-500">Rating: {p.rating}</p>
            </div>
          ))}
        </div>

        {/* Problem */}
        <div className="bg-white p-6 rounded shadow space-y-3">
          <h3 className="text-lg font-bold">{problem.title}</h3>

          <p>{problem.description}</p>

          <div>
            <p className="font-semibold">Input Format</p>
            <pre className="bg-gray-100 p-2 rounded">
              {problem.inputFormat}
            </pre>
          </div>

          <div>
            <p className="font-semibold">Output Format</p>
            <pre className="bg-gray-100 p-2 rounded">
              {problem.outputFormat}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Sample Input</p>
              <pre className="bg-gray-100 p-2 rounded">
                {problem.sampleInput}
              </pre>
            </div>

            <div>
              <p className="font-semibold">Sample Output</p>
              <pre className="bg-gray-100 p-2 rounded">
                {problem.sampleOutput}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MatchPage;