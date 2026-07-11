import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

export default function CodeEditor({ modelRef, content, language = "python", readOnly = false }) {
    const containerRef = useRef(null);
    const editorRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        modelRef.current = monaco.editor.createModel(content, language);

        editorRef.current = monaco.editor.create(containerRef.current, {
            model: modelRef.current,
            theme: "vs-dark",
            automaticLayout: true,
            wordWrap: "on",
            minimap: { enabled: false },
            readOnly,
            scrollBeyondLastLine: false,
            lineNumbers: "on",
        });

        return () => {
            try {
                editorRef.current && editorRef.current.dispose();
                modelRef.current && modelRef.current.dispose();
            } catch (e) {
                console.warn("Error disposing Monaco editor:", e);
            }
        };
    }, []);

    useEffect(() => {
        if (!modelRef.current) return;
        if (modelRef.current.getValue() !== content) {
            modelRef.current.setValue(content || "");
        }
    }, [content]);

    useEffect(() => {
        if (!modelRef.current) return;
        try {
            monaco.editor.setModelLanguage(modelRef.current, language || "plaintext");
        } catch (e) {
            console.warn(`Failed to set language to ${language}:`, e);
        }
    }, [language]);

    useEffect(() => {
        if (!editorRef.current) return;
        editorRef.current.updateOptions({ readOnly });
    }, [readOnly]);

    return (
        <div style={{ height: "100%", minHeight: 300 }} className="rounded overflow-hidden">
            <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
        </div>
    );
}
