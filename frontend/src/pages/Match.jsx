import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CodeEditor from "../components/CodeEditor";
import { useAuth } from "../context/AuthContext";

const Match = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState("");

  const [sourceCode, setSourceCode] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [runningSample, setRunningSample] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);

  /* ================= FETCH MATCH ================= */

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

  /* ================= POLLING (FIXED) ================= */

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

  /* ================= RUN SAMPLE ================= */

  const runSample = async () => {
    if (!sourceCode.trim()) return;

    try {
      setRunningSample(true);
      setSampleOutput("");

      const res = await api.post("/judge/run-sample", {
        sourceCode,
        input: match.problem.sampleInput
      });

      setSampleOutput(res.data.output || "(no output)");
    } catch {
      setSampleOutput("Error running sample");
    } finally {
      setRunningSample(false);
    }
  };

  /* ================= SUBMIT CODE ================= */

 const submitCode = async () => {
  if (!sourceCode.trim()) return;

  try {
    setSubmitting(true);
    setVerdict("");

    const res = await api.post("/judge/evaluate", {
      matchId,
      problemId: match.problem.id,
      languageId: 71,
      sourceCode
    });

    setVerdict(res.data.verdict);
    setHasSubmitted(true); // ✅ IMPORTANT
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
  /* ================= RESULT SCREEN ================= */

  if (match && match.status === "COMPLETED") {
    const myId = user.id.toString();

    const me = match.players.find(
      (p) =>
        p.userId?.toString?.() === myId ||
        p.userId?._id?.toString() === myId
    );

    const opponent = match.players.find(
      (p) =>
        p.userId?.toString?.() !== myId &&
        p.userId?._id?.toString() !== myId
    );

    if (!me || !opponent) {
      return (
        <p className="text-center mt-10 text-red-500">
          Failed to resolve match result
        </p>
      );
    }

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

          <p className={`text-xl font-semibold ${color}`}>
            {me.result}
          </p>

          <p className="text-sm text-gray-600">
            vs {opponent.username}
          </p>

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

  /* ================= LOADING / ERROR ================= */

  if (loading) {
    return <p className="text-center mt-10">Loading match...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  /* ================= MAIN MATCH UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 p-4 grid grid-cols-2 gap-4">
      {/* PROBLEM */}
      <div className="bg-white p-4 rounded shadow overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">
          {match.problem.title}
        </h2>

        <p className="mb-4">{match.problem.description}</p>

        <h4 className="font-semibold">Input Format</h4>
        <pre className="bg-gray-100 p-2 mb-2">
          {match.problem.inputFormat}
        </pre>

        <h4 className="font-semibold">Output Format</h4>
        <pre className="bg-gray-100 p-2 mb-2">
          {match.problem.outputFormat}
        </pre>

        <h4 className="font-semibold">Sample</h4>
        <pre className="bg-gray-100 p-2 whitespace-pre-wrap">
Input:
{match.problem.sampleInput}

Output:
{match.problem.sampleOutput}
        </pre>
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
            disabled={runningSample || !!verdict}
            className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
          >
            {runningSample ? "Running..." : "Run Sample"}
          </button>

          <button
            onClick={submitCode}
            disabled={submitting || !!verdict}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        {sampleOutput && (
          <div className="mt-4 bg-black text-green-400 p-3 rounded text-sm whitespace-pre-wrap">
            {sampleOutput}
          </div>
        )}

        {verdict && (
          <p className="mt-4 text-center font-semibold">
            Verdict: {verdict}
          </p>
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