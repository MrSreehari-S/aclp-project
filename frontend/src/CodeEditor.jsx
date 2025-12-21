import { useState } from "react";
import ProblemSelector from "./ProblemSelector";

const PYTHON_STARTER_CODE = `# Read input and write your solution here`;

function CodeEditor() {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sampleOutput, setSampleOutput] = useState(null);

  const submitCode = async () => {
    setSampleOutput(null);

    if (!problem) {
      setResult({
        message: "Please select a problem first.",
        results: []
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/judge/evaluate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId: problem._id,
            sourceCode: code,
            languageId: 71
          })
        }
      );

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        message: "Error connecting to backend",
        results: []
      });
    }

    setLoading(false);
  };

  const runSample = async () => {
    if (!problem) {
      setSampleOutput("Please select a problem first.");
      return;
    }

    setSampleOutput("Running...");

    try {
      const response = await fetch(
        "http://localhost:5000/api/judge/run-sample",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceCode: code,
            input: problem.sampleInput
          })
        }
      );

      const data = await response.json();
      setSampleOutput(data.output || "No output");
    } catch {
      setSampleOutput("Error running sample input");
    }
  };

  const resetEditor = () => {
    if (!window.confirm("Clear code and reset editor?")) return;
    setCode(PYTHON_STARTER_CODE);
    setResult(null);
    setSampleOutput(null);
    setShowHint(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <ProblemSelector
        onSelect={(p) => {
          setProblem(p);
          setCode(PYTHON_STARTER_CODE);
          setResult(null);
          setSampleOutput(null);
          setShowHint(false);
        }}
      />

      {problem && (
        <div className="bg-white shadow rounded p-6 space-y-3">
          <h2 className="text-2xl font-bold">{problem.title}</h2>

          <p><strong>Description:</strong> {problem.description}</p>
          <p><strong>Difficulty:</strong> {problem.difficulty}</p>
          <p><strong>Input Format:</strong> {problem.inputFormat}</p>
          <p><strong>Output Format:</strong> {problem.outputFormat}</p>

          <div>
            <p className="font-semibold">Sample Input</p>
            <pre className="bg-gray-100 p-2 rounded">{problem.sampleInput}</pre>
          </div>

          <div>
            <p className="font-semibold">Sample Output</p>
            <pre className="bg-gray-100 p-2 rounded">{problem.sampleOutput}</pre>
          </div>

          <hr />

          <h3 className="font-semibold">Input Guidance</h3>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            <li>Input may be space- or line-separated</li>
            <li>Use <code>input().split()</code> for multiple values</li>
            <li>Always use <code>print()</code></li>
          </ul>

          <button
            className="text-blue-600 underline"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? "Hide Hint" : "Show Hint"}
          </button>

          {showHint && (
            <div className="bg-blue-50 p-3 rounded text-sm">
              <strong>Hint:</strong> Read both numbers and print their sum.
            </div>
          )}
        </div>
      )}

      <textarea
        className="w-full border rounded p-3 font-mono"
        rows="10"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <div className="flex gap-4">
        <button
          onClick={runSample}
          className="bg-gray-600 text-white px-6 py-2 rounded"
        >
          Run Sample
        </button>

        <button
          onClick={submitCode}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Running..." : "Submit"}
        </button>

        <button
          onClick={resetEditor}
          className="bg-red-500 text-white px-6 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {sampleOutput !== null && (
        <div>
          <h3 className="font-semibold">Sample Run Output</h3>
          <pre className="bg-gray-100 p-3 rounded">{sampleOutput}</pre>
        </div>
      )}

      {result?.results && (
        <div className="space-y-4">
          <h2
            className={`text-xl font-bold ${
              result.passedCount === result.total
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {result.message}
          </h2>

          {result.results.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded border ${
                test.verdict === "AC" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <h4>
                Test Case {index + 1}{" "}
                {test.verdict === "AC" ? "✅" : "❌"} ({test.verdict})
              </h4>

              <p className="font-semibold">Input</p>
              <pre className="bg-gray-100 p-2 rounded">{test.input}</pre>

              <p className="font-semibold">Expected Output</p>
              <pre className="bg-gray-100 p-2 rounded">
                {test.expectedOutput}
              </pre>

              <p className="font-semibold">Your Output</p>
              <pre className="bg-gray-100 p-2 rounded">
                {test.actualOutput || "No output detected. Did you forget print()?"}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CodeEditor;
