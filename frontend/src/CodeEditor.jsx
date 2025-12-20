import { useState } from "react";
import ProblemSelector from "./ProblemSelector";

function CodeEditor() {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitCode = async () => {
    if (!problem) {
      setResult("Please select a problem first.");
      return;
    }

    setLoading(true);
    setResult("");

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
      setResult("Error connecting to backend");
    }

    setLoading(false);
  };

  return (
    <div>
      <ProblemSelector onSelect={setProblem} />

      {problem && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
          <h2>{problem.title}</h2>
          <p><strong>Description:</strong> {problem.description}</p>
          <p><strong>Difficulty:</strong> {problem.difficulty}</p>
          <p><strong>Input Format:</strong> {problem.inputFormat}</p>
          <p><strong>Output Format:</strong> {problem.outputFormat}</p>

          <p><strong>Sample Input:</strong></p>
          <pre>{problem.sampleInput}</pre>

          <p><strong>Sample Output:</strong></p>
          <pre>{problem.sampleOutput}</pre>
        </div>
      )}

      <h3>Write your Python code:</h3>

      <textarea
        rows="10"
        cols="80"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter Python code here"
      />

      <br /><br />

      <button onClick={submitCode} disabled={loading}>
        {loading ? "Running..." : "Submit"}
      </button>

      {result && (
  <div style={{ marginTop: "20px" }}>
    {/* Overall Verdict */}
    <h2 style={{ color: result.passedCount === result.total ? "green" : "red" }}>
      {result.message}
    </h2>

    {/* Test Case Results */}
    {result.results.map((test, index) => (
      <div
        key={index}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
          backgroundColor: test.passed ? "#e6ffed" : "#ffe6e6"
        }}
      >
        <h4>
          Test Case {index + 1} {test.passed ? "✅" : "❌"}
        </h4>

        <p><strong>Input:</strong></p>
        <pre>{test.input}</pre>

        <p><strong>Expected Output:</strong></p>
        <pre>{test.expectedOutput}</pre>

        <p><strong>Your Output:</strong></p>
        <pre>{test.actualOutput || "(no output)"}</pre>
      </div>
    ))}
  </div>
)}

    </div>
  );
}

export default CodeEditor;
