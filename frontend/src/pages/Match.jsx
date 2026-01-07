import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CodeEditor from "../components/CodeEditor";
import { useAuth } from "../context/AuthContext";

const Match = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState("");

  const [sourceCode, setSourceCode] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [runningSample, setRunningSample] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchMatch = async () => {
    try {
      const res = await api.get(`/match/${matchId}`);
      setMatch(res.data);
    } catch {
      setError("Failed to load match");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/match/${matchId}`);
        setMatch(res.data);

        if (res.data.status === "COMPLETED") {
          clearInterval(interval);
        }
      } catch {
        console.error("Polling failed");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [matchId]);

  //sync rating after match completion

  useEffect(() => {
    if (!match || match.status !== "COMPLETED") return;

    const myId = user.id.toString();

    const me = match.players.find(
      (p) =>
        p.userId?.toString?.() === myId || p.userId?._id?.toString() === myId
    );

    if (!me) return;

    setUser((prev) => {
      const updatedUser = {
        ...prev,
        rating: prev.rating + (me.ratingChange || 0),
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, [match?.status]);

  const runSample = async () => {
    if (!sourceCode.trim()) return;

    try {
      setRunningSample(true);
      setSampleOutput("");

      const res = await api.post("/judge/run-sample", {
        sourceCode,
        input: match.problem.sampleInput,
      });

      setSampleOutput(res.data.output || "(no output)");
    } catch {
      setSampleOutput("Error running sample");
    } finally {
      setRunningSample(false);
    }
  };

  const submitCode = async () => {
    if (!sourceCode.trim()) return;

    try {
      setSubmitting(true);
      setVerdict("");

      const res = await api.post("/judge/evaluate", {
        matchId,
        problemId: match.problem.id,
        languageId: 71,
        sourceCode,
      });

      setVerdict(res.data.verdict);
      setHasSubmitted(true);
    } catch (err) {
      if (err.response?.status === 429) {
        setVerdict(err.response.data.message);
      } else {
        setVerdict("Submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (match && match.status === "COMPLETED") {
    const myId = user.id.toString();

    const me = match.players.find(
      (p) =>
        p.userId?.toString?.() === myId || p.userId?._id?.toString() === myId
    );

    const opponent = match.players.find((p) => p !== me);

    const color =
      me.result === "WIN"
        ? "text-green-600"
        : me.result === "LOSS"
        ? "text-red-600"
        : "text-yellow-600";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow w-96 text-center space-y-4">
          <h2 className="text-2xl font-bold">Match Result</h2>

          <p className={`text-xl font-semibold ${color}`}>{me.result}</p>

          <p className="text-sm text-gray-600">vs {opponent.username}</p>

          <p className="text-sm">
            Rating change:{" "}
            <span className="font-semibold">
              {me.ratingChange > 0 ? "+" : ""}
              {me.ratingChange}
            </span>
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-center mt-10">Loading match...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 grid grid-cols-2 gap-4">
      {/* PROBLEM */}
      <div className="bg-white p-4 rounded shadow overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">{match.problem.title}</h2>
        <p className="mb-4">{match.problem.description}</p>
      </div>

      {/* EDITOR */}
      <div className="bg-white p-4 rounded shadow flex flex-col">
        <CodeEditor
          value={sourceCode}
          onChange={setSourceCode}
          disabled={hasSubmitted}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={runSample}
            disabled={runningSample || hasSubmitted}
            className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
          >
            Run Sample
          </button>

          <button
            onClick={submitCode}
            disabled={submitting || hasSubmitted}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Submit
          </button>
        </div>

        {verdict && (
          <p className="mt-4 text-center font-semibold">Verdict: {verdict}</p>
        )}

        {hasSubmitted && match.status === "ONGOING" && (
          <p className="mt-2 text-center text-blue-600 font-medium">
            Submission received. Waiting for opponent to submit…
          </p>
        )}
      </div>
    </div>
  );
};

export default Match;
