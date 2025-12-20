import { useState } from "react";
import ProblemSelector from "./ProblemSelector";

function CodeEditor() {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const submitCode = async () => {
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
    } catch (error) {
      setResult({
        message: "Error connecting to backend",
        results: []
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <ProblemSelector onSelect={setProblem} />

      {problem && (
        <div className="bg-white shadow rounded p-6 space-y-3">
          <h2 className="text-2xl font-bold">{problem.title}</h2>

          <p><span className="font-semibold">Description:</span> {problem.description}</p>
          <p><span className="font-semibold">Difficulty:</span> {problem.difficulty}</p>
          <p><span className="font-semibold">Input Format:</span> {problem.inputFormat}</p>
          <p><span className="font-semibold">Output Format:</span> {problem.outputFormat}</p>

          <div>
            <p className="font-semibold">Sample Input:</p>
            <pre className="bg-gray-100 p-2 rounded">{problem.sampleInput}</pre>
          </div>

          <div>
            <p className="font-semibold">Sample Output:</p>
            <pre className="bg-gray-100 p-2 rounded">{problem.sampleOutput}</pre>
          </div>

          <hr />

          <div>
            <h3 className="font-semibold text-lg">Input Guidance</h3>
            <ul className="list-disc ml-6 text-sm text-gray-700">
              <li>Input may be space-separated or line-separated</li>
              <li>Use <code className="bg-gray-200 px-1 rounded">input().split()</code> when reading multiple values</li>
              <li>Always use <code className="bg-gray-200 px-1 rounded">print()</code> to show output</li>
            </ul>

            <button
              className="mt-2 text-blue-600 underline"
              onClick={() => setShowHint(!showHint)}
            >
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>

            {showHint && (
              <div className="mt-2 bg-blue-50 p-3 rounded text-sm">
                <strong>Hint:</strong> Read both numbers first, then print their sum.
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Write your Python code</h3>
        <textarea
          className="w-full border rounded p-3 font-mono"
          rows="10"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Python code here"
        />
      </div>

      <button
        onClick={submitCode}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Running..." : "Submit"}
      </button>

      {result && result.results && (
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
                test.passed ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <h4 className="font-semibold">
                Test Case {index + 1} {test.passed ? "✅" : "❌"}
              </h4>

              <p className="font-semibold">Input</p>
              <pre className="bg-gray-100 p-2 rounded">{test.input}</pre>

              <p className="font-semibold">Expected Output</p>
              <pre className="bg-gray-100 p-2 rounded">{test.expectedOutput}</pre>

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
