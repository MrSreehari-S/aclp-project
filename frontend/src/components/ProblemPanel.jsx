const ProblemPanel = ({ problem }) => {
  return (
    <div className="bg-white p-4 rounded shadow overflow-y-auto">
      <h2 className="text-xl font-bold mb-2">{problem.title}</h2>

      <p className="text-sm text-gray-700 whitespace-pre-line mb-4">
        {problem.description}
      </p>

      <div className="text-sm">
        <h4 className="font-semibold">Sample Input</h4>
        <pre className="bg-gray-100 p-2 rounded">
          {problem.sampleInput}
        </pre>

        <h4 className="font-semibold mt-2">Sample Output</h4>
        <pre className="bg-gray-100 p-2 rounded">
          {problem.sampleOutput}
        </pre>
      </div>
    </div>
  );
};

export default ProblemPanel;