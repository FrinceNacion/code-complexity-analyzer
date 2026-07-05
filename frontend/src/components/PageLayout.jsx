import React, { useState } from "react";
import UploadZone from "./UploadZone";
import CodeEditor from "./CodeEditor";
import ResultsPanel from "./ResultsPanel";

const SAMPLE_PY = `
#copy paste your code here
def greet(name):
    print(f"Hello, {name}!")

for i in range(3):
    greet('world')
`;

export default function PageLayout() {
    const [fileInfo, setFileInfo] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    const onFileSelect = (info) => {
        setFileInfo(info);
        if (info) {
            setAnalysis({ fileName: info.name, summary: {} });
        } else {
            setAnalysis(null);
        }
    };

    return (
        <div className="container-fluid p-4 pt-5" style={{ minHeight: "100vh" }}>
            <div className="row gx-3 gy-3 h-100" style={{ minHeight: "100%" }}>
                <div className="col-12 col-xl-5 d-flex h-100">
                    <div className="card p-3 d-flex flex-column w-100 mb-0">
                        <h5 className="mb-3">Source Input</h5>
                        <UploadZone onFileSelect={onFileSelect} />
                        <div className="flex-grow-1 mt-3" style={{ minHeight: 260 }}>
                            <CodeEditor
                                content={fileInfo?.content ?? SAMPLE_PY}
                                language={fileInfo?.language}
                                readOnly={false}
                            />
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
