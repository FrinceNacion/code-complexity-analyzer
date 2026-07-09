import React, { useState, useRef, useEffect } from "react";
import UploadZone from "./UploadZone";
import CodeEditor from "./CodeEditor";
import ResultsPanel from "./ResultsPanel";
import "./font-style.css";
import { useAnalysis } from "../hooks/useAnalysis";
import { detectLanguage } from "./utils/language_detector";

const SAMPLE_PY = `#copy paste your code here
def greet(name):
    print(f"Hello, {name}!")

for i in range(3):
    greet('world')
`;

export default function PageLayout() {
    const { analyze } = useAnalysis();
    const [fileInfo, setFileInfo] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [codeContent, setCodeContent] = useState(SAMPLE_PY);
    const [modelLanguage, setModelLanguage] = useState("python");

    useEffect(() => {
        if (fileInfo?.content) {
            setCodeContent(fileInfo.content);
            setModelLanguage(fileInfo.language);
        }
    }, [fileInfo]);

    const onAnalyzeClick = async () => {
        if (!codeContent || codeContent.trim() === "") return;

        if (!fileInfo?.file) {
            const blob = new Blob([codeContent], { type: "text/plain" });
            const file_name = "untitled.py"; // Default name for the file
            // Detect language based on the default name (can't detect from content so no js/ts detection for now)
            const file_language = detectLanguage(file_name); 
            const file = new File([blob], file_name, { type: "text/plain" });
            setFileInfo({ file, name: file_name, content: codeContent, language: file_language });
        }

        setIsLoading(true);
        setAnalysis(null);

        try {
            const result = await analyze(fileInfo);
            setAnalysis({ fileName: fileInfo.name, response: result });
        } catch (error) {
            setAnalysis({ fileName: fileInfo.name, error: { error: error.message } });
        } finally {
            setIsLoading(false);
        }
    };

    const onFileSelect = (info) => {
        setFileInfo(info);
        setAnalysis(null);
    };

    const onClearFile = () => {
        setFileInfo(null);
        setCodeContent(SAMPLE_PY);
        setModelLanguage("python");
        if (onFileSelect) onFileSelect(null);
    };

    return (
        <div className="container-fluid p-4 pt-5" style={{ minHeight: "100vh" }}>
            <div className="row gx-3 gy-3 h-100" style={{ minHeight: "100%" }}>
                <div className="col-12 col-xl-5 d-flex h-100">
                    <div className="card p-3 d-flex flex-column w-100 mb-0">
                        <h5 className="mb-3 fw-bold">Source Input</h5>
                        <UploadZone
                            fileInfo={fileInfo}
                            setFileInfo={setFileInfo}
                            onClearFile={onClearFile}
                            onFileSelect={onFileSelect} />
                        <div className="flex-grow-1 mt-3 mb-3" style={{ minHeight: 260 }}>
                            <CodeEditor
                                content={codeContent}
                                language={modelLanguage}
                                readOnly={false}
                            />
                        </div>
                        <div
                            className="btn btn-sm ms-auto col-12 col-sm-3 d-flex justify-content-center"
                            style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4" }}
                            onClick={onAnalyzeClick}
                        >
                            <p className="mb-0 cascadia-code-font">
                                Analyze<span style={{ color: "#fad300" }}>()</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-7 d-flex">
                    <ResultsPanel analysis={analysis} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
