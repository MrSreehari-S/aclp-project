import { useState } from "react";

const problemId = "690258842474110a9965734b";

function CodeEditor() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const submitCode = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/judge/evaluate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            sourceCode: code,
            languageId: 71 // Python
          })
        }
      );

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult("Error connecting to backend");
    }

    setLoading(false);
  };

  return (
    <div>
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

      <h3>Result:</h3>
      <pre>{result}</pre>
    </div>
  );
}

export default CodeEditor;
