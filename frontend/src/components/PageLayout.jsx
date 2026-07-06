import React, { useState } from "react";
import UploadZone from "./UploadZone";
import CodeEditor from "./CodeEditor";
import ResultsPanel from "./ResultsPanel";
import "./font-style.css";
import { useAnalysis } from "../hooks/useAnalysis";

const SAMPLE_PY = `#copy paste your code here
def greet(name):
    print(f"Hello, {name}!")

for i in range(3):
    greet('world')
`;

export default function PageLayout() {
    const { result, error, analyze } = useAnalysis();
    const [fileInfo, setFileInfo] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    const onAnalyzeClick = async () => {
        analyze(fileInfo);
        if (result) {
            setAnalysis({ fileName: fileInfo.name, response: result });
        } else if (error) {
            setAnalysis({ fileName: fileInfo.name, error: { error } });
        }
    }

    const onFileSelect = (info) => {
        setFileInfo(info);
        setAnalysis(null); // Reset analysis when a new file is selected
    };

    return (
        <div className="container-fluid p-4 pt-5" style={{ minHeight: "100vh" }}>
            <div className="row gx-3 gy-3 h-100" style={{ minHeight: "100%" }}>
                <div className="col-12 col-xl-5 d-flex h-100">
                    <div className="card p-3 d-flex flex-column w-100 mb-0">
                        <h5 className="mb-3">Source Input</h5>
                        <UploadZone onFileSelect={onFileSelect} />
                        <div className="flex-grow-1 mt-3 mb-3" style={{ minHeight: 260 }}>
                            <CodeEditor
                                content={fileInfo?.content ?? SAMPLE_PY}
                                language={fileInfo?.language}
                                readOnly={false}
                            />
                        </div>
                        <div className="btn btn-sm ms-auto col-12 col-sm-3 d-flex justify-content-center" style={{          backgroundColor: "#1e1e1e", color: "#d4d4d4" }}
                        onClick={onAnalyzeClick}>
                            <p className="mb-0 cascadia-code-font">Analyze<span style={{color: "#fad300"}}>()</span></p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-7 d-flex">
                    <ResultsPanel analysis={analysis} />
                </div>
            </div>
        </div>
    );
}
