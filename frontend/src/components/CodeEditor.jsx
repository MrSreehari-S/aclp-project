import { useState } from "react";
import api from "../api/axios";

const CodeEditor = ({ matchId, problemId }) => {
  const [code, setCode] = useState(
    "a, b = map(int, input().split())\nprint(a + b)"
  );
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runSample = async () => {
    setLoading(true);
    try {
      const res = await api.post("/judge/run-sample", {
        sourceCode: code,
        input: "1 2",
      });
      setOutput(res.data.output);
    } catch {
      setOutput("Error running sample");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    setLoading(true);
    try {
      const res = await api.post("/judge/evaluate", {
        matchId,
        problemId,
        languageId: 71,
        sourceCode: code,
      });

      setOutput(`Verdict: ${res.data.verdict}`);
    } catch {
      setOutput("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <textarea
        className="w-full h-48 border p-2 font-mono text-sm"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={runSample}
          className="bg-gray-600 text-white px-4 py-1 rounded"
        >
          Run Sample
        </button>

        <button
          onClick={submitCode}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          Submit
        </button>
      </div>

      <pre className="bg-black text-green-400 p-2 rounded text-sm">
        {loading ? "Running..." : output}
      </pre>
    </div>
  );
};

export default CodeEditor;
