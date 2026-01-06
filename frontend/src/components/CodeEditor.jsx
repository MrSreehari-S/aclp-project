const CodeEditor = ({ value, onChange, disabled = false }) => {
  return (
    <textarea
      className="flex-1 border p-2 font-mono resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      placeholder="Write your solution here..."
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default CodeEditor;