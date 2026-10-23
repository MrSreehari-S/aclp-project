import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

const THEME_NAME = "codeclash-obsidian";

const CodeEditor = ({ value, onChange, disabled }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Define custom high-end obsidian dark theme for Monaco
    monaco.editor.defineTheme(THEME_NAME, {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "64748B", fontStyle: "italic" },
        { token: "keyword", foreground: "C084FC", fontStyle: "bold" },
        { token: "identifier", foreground: "E2E8F0" },
        { token: "string", foreground: "34D399" },
        { token: "number", foreground: "38BDF8" },
        { token: "operator", foreground: "F472B6" },
        { token: "type", foreground: "FBBF24" },
      ],
      colors: {
        "editor.background": "#080C16",
        "editor.foreground": "#E2E8F0",
        "editorCursor.foreground": "#38BDF8",
        "editor.lineHighlightBackground": "#0F1626",
        "editorLineNumber.foreground": "#334155",
        "editorLineNumber.activeForeground": "#818CF8",
        "editor.selectionBackground": "#4338CA55",
        "editor.inactiveSelectionBackground": "#312E8130",
        "editorIndentGuide.background1": "#1E293B",
        "editorIndentGuide.activeBackground1": "#4F46E5",
      },
    });

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: value || "",
      language: "python",
      theme: THEME_NAME,
      readOnly: disabled,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: "'JetBrains Mono', Consolas, 'Fira Code', monospace",
      fontLigatures: true,
      cursorBlinking: "phase",
      cursorSmoothCaretAnimation: "on",
      cursorWidth: 2,
      smoothScrolling: true,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      roundedSelection: true,
      renderLineHighlight: "line",
      padding: { top: 14, bottom: 14 },
      bracketPairColorization: { enabled: true },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
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

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden border border-white/[0.06] shadow-inner bg-[#080C16]"
    />
  );
};

export default CodeEditor;