const CodeEditor = ({ value, onChange, disabled = false }) => {
  return (
    <textarea
      className="w-full h-full border p-4 font-mono resize-none rounded-lg bg-black/40 text-green-300 focus:outline-none disabled:bg-gray-800 disabled:cursor-not-allowed"
      placeholder="# Write your solution here..."
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default CodeEditor;