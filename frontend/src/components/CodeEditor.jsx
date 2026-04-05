import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

const CodeEditor = ({ value, onChange, disabled }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: value || "",
      language: "python",
      theme: "vs-dark",
      readOnly: disabled,
      fontSize: 14,
      automaticLayout: true,
      minimap: { enabled: false },
    });

    editorRef.current.onDidChangeModelContent(() => {
      const val = editorRef.current.getValue();
      onChange(val);
    });

    return () => editorRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value || "");
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: disabled });
    }
  }, [disabled]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
};

export default CodeEditor;