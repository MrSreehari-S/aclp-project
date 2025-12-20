import { useEffect, useState } from "react";

function ProblemSelector({ onSelect }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/problems")
      .then((res) => res.json())
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading problems...</p>;
  }

  return (
    <div>
      <h3>Select a Problem:</h3>

      <select
        onChange={(e) => {
          const selected = problems.find(
            (p) => p._id === e.target.value
          );
          onSelect(selected);
        }}
      >
        <option value="">-- Choose a problem --</option>
        {problems.map((problem) => (
          <option key={problem._id} value={problem._id}>
            {problem.title} ({problem.difficulty})
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProblemSelector;
