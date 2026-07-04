import React from "react";

export default function ResultsPanel({ analysis = null }) {
    return (
        <div className="card h-100 w-100 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Analysis Results</h5>
                <small className="text-muted">Status: {analysis ? "Ready" : "Idle"}</small>
            </div>

            <div style={{ overflow: "auto" }} className="flex-grow-1">
                {analysis ? (
                    <div>
                        <div className="mb-3">
                            <strong>File:</strong> {analysis.fileName}
                        </div>
                        <div className="mb-3">
                            <strong>Summary:</strong>
                            <div className="small text-muted">Cyclomatic complexity, Halstead metrics, etc.</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted">
                        <p className="mb-2">No analysis performed yet.</p>
                        <p className="small">Upload a file on the left to run a quick analysis. Results will appear here with metrics, charts, and suggestions.</p>
                        <div className="mt-3 p-3 bg-light rounded">
                            <div className="placeholder-glow">
                                <div className="placeholder col-7"></div>
                                <div className="placeholder col-4"></div>
                                <div className="placeholder col-4"></div>
                                <div className="placeholder col-6"></div>
                                <div className="placeholder col-8"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
