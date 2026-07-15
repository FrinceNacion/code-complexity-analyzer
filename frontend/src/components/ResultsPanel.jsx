import AnalysisResult from "./AnalysisResult";

export default function ResultsPanel({ 
    analysis = null, 
    isLoading = false,
    selectedFunction = null,
    onSelectFunction
}) {
    const response = analysis?.response ?? analysis ?? null;
    const error = analysis?.error?.error ?? null;

    return (
        <div className="card h-100 w-100 p-3 d-flex flex-column mb-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-bold">Analysis Results</h5>
                <small className="text-muted">
                    Status: {isLoading ? "Analyzing..." : analysis ? "Ready" : "Idle"}
                </small>
            </div>

            <div className="flex-grow-1 overflow-hidden">
                {isLoading ? (
                    <div className="text-muted">
                        <p className="mb-2">Analyzing your file...</p>
                        <div className="mt-3 p-3 bg-light rounded">
                            <div className="placeholder-glow">
                                <div className="placeholder col-7"></div>
                                <div className="placeholder col-4"></div>
                                <div className="placeholder col-4"></div>
                                <div className="placeholder col-6"></div>
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger mb-3" role="alert">
                        <strong>Analysis failed.</strong>
                        <div className="small">{error}</div>
                    </div>
                ) : response ? (
                    <AnalysisResult 
                        response={response} 
                        selectedFunction={selectedFunction}
                        onSelectFunction={onSelectFunction}
                    />
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
