import { useState, useMemo } from "react";
import { 
    formatValue, 
    getRiskBadgeClass, 
    getMetricInsight, 
    computeFunctionMetrics,
    computeProjectMetrics
} from "./utils/formatters";
import FunctionTable from "./FunctionTable";
import CallGraph from "./CallGraph";
import MetricsPanel from "./MetricsPanel";
import { 
    AlertTriangle, 
    Info, 
    Lightbulb,
    FileText
} from "lucide-react";

export default function AnalysisResult({ response, selectedFunction, onSelectFunction }) {
    const [activeTab, setActiveTab] = useState("overview");

    const fileName = response?.file_name ?? "Unknown";
    const summary = response?.summary ?? null;
    const fileFeatures = response?.file_features ?? null;

    const functions = useMemo(() => {
        return Array.isArray(response?.functions) ? response.functions : [];
    }, [response]);

    const callGraph = useMemo(() => {
        return response?.call_graph ?? { nodes: [], edges: [] };
    }, [response]);

    const projectMetrics = useMemo(() => computeProjectMetrics(response), [response]);

    const recommendations = useMemo(() => {
        const list = [];
        if (!functions.length) return list;

        const criticalFunctions = functions.filter(fn => fn.cyclomatic_complexity > 10);
        const warningFunctions = functions.filter(fn => fn.cyclomatic_complexity > 4 && fn.cyclomatic_complexity <= 10);
        
        if (criticalFunctions.length > 0) {
            criticalFunctions.forEach(fn => {
                list.push({
                    type: "danger",
                    title: "Critical Complexity",
                    message: `Function "${fn.name}" has critical cyclomatic complexity of ${fn.cyclomatic_complexity}. This represents a high risk of bugs and makes code difficult to test. Refactor this function by breaking it down into smaller sub-functions.`
                });
            });
        }
        if (warningFunctions.length > 0) {
            list.push({
                type: "warning",
                title: "Moderate Complexity",
                message: `Functions [${warningFunctions.map(f => `"${f.name}"`).join(", ")}] have moderate complexity (score 5-10). Keep them modular to prevent future maintenance bottlenecks.`
            });
        }

        const deepNestingFunctions = functions.filter(fn => fn.max_nesting_depth > 4);
        if (deepNestingFunctions.length > 0) {
            deepNestingFunctions.forEach(fn => {
                list.push({
                    type: "warning",
                    title: "Deep Nesting Depth",
                    message: `Function "${fn.name}" reaches a nesting level of ${fn.max_nesting_depth}. Deep indentation indicates high cognitive complexity. Consider using guard clauses to return early and flatten structure.`
                });
            });
        }

        functions.forEach(fn => {
            const computed = computeFunctionMetrics(fn);
            if (computed.maintainability_index < 50) {
                list.push({
                    type: "danger",
                    title: "Low Maintainability",
                    message: `Function "${fn.name}" scored ${computed.maintainability_index}/100 on the maintainability index. This is due to high complexity relative to its volume. Immediate refactoring is recommended.`
                });
            }
        });

        const recursiveFunctions = functions.filter(fn => fn.is_recursive);
        if (recursiveFunctions.length > 0) {
            recursiveFunctions.forEach(fn => {
                list.push({
                    type: "info",
                    title: "Recursive Function",
                    message: `Function "${fn.name}" uses recursion. Ensure there is a robust terminating base case to avoid stack overflow risks during large inputs.`
                });
            });
        }

        if (list.length === 0) {
            list.push({
                type: "success",
                title: "All Clear",
                message: "Excellent! All functions fall within clean, low-complexity guidelines. Code maintainability is superb."
            });
        }

        return list;
    }, [functions]);

    // Lookup selected function details
    const selectedFunctionDetails = useMemo(() => {
        if (!selectedFunction) return null;
        return functions.find(fn => fn.name === selectedFunction.name) ?? null;
    }, [selectedFunction, functions]);

    // Computed metrics for selected function
    const selectedFunctionMetrics = useMemo(() => {
        if (!selectedFunctionDetails) return null;
        return computeFunctionMetrics(selectedFunctionDetails);
    }, [selectedFunctionDetails]);

    return (
        <div className="d-flex flex-column h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <div className="d-flex align-items-center gap-2">
                    <FileText size={20} className="text-muted" />
                    <div>
                        <h6 className="fw-bold mb-0 text-dark">{fileName}</h6>
                        <span className="text-muted small text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                            Language: {projectMetrics.rating === "A" && functions.length === 0 ? "Unknown" : "Python"}
                        </span>
                    </div>
                </div>
                
                <div className="d-flex align-items-center gap-2 bg-light border px-2 py-1 rounded">
                    <span className="small text-muted">Health:</span>
                    <span 
                        className="fw-bold px-2 rounded" 
                        style={{ 
                            backgroundColor: `${projectMetrics.ratingColor}20`, 
                            color: projectMetrics.ratingColor,
                            fontSize: "0.85rem"
                        }}
                    >
                        {projectMetrics.rating} Grade
                    </span>
                </div>
            </div>

            <ul className="nav nav-tabs border-bottom-0 mb-3" role="tablist">
                <li className="nav-item">
                    <button 
                        className={`nav-link py-2 px-3 ${activeTab === "overview" ? "active fw-bold text-dark border-bottom-2 border-primary" : "text-muted border-0"}`} 
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link py-2 px-3 ${activeTab === "functions" ? "active fw-bold text-dark border-bottom-2 border-primary" : "text-muted border-0"}`} 
                        onClick={() => setActiveTab("functions")}
                    >
                        Functions ({functions.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link py-2 px-3 ${activeTab === "call_graph" ? "active fw-bold text-dark border-bottom-2 border-primary" : "text-muted border-0"}`} 
                        onClick={() => setActiveTab("call_graph")}
                    >
                        Call Graph
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link py-2 px-3 ${activeTab === "metrics" ? "active fw-bold text-dark border-bottom-2 border-primary" : "text-muted border-0"}`} 
                        onClick={() => setActiveTab("metrics")}
                    >
                        Metrics Dashboard
                    </button>
                </li>
            </ul>

            <div className="flex-grow-1 overflow-y-auto pe-1" style={{ maxHeight: "calc(100vh - 250px)" }}>
                
                {activeTab === "overview" && (
                    <div className="d-flex flex-column gap-3 animate-fade-in">
                        {summary && (
                            <div className="card p-3 border shadow-sm bg-white">
                                <h6 className="fw-bold mb-3 text-dark">File Quality Overview</h6>
                                <div className="row g-2">
                                    <div className="col-6 col-md-3">
                                        <div className="border rounded p-2 text-center bg-light">
                                            <div className="small text-muted mb-1">Functions</div>
                                            <h4 className="fw-bold text-dark mb-0">{summary.total_functions ?? 0}</h4>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="border rounded p-2 text-center bg-light">
                                            <div className="small text-muted mb-1">Avg Complexity</div>
                                            <h4 className="fw-bold text-dark mb-0">{formatValue(summary.avg_complexity)}</h4>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="border rounded p-2 text-center bg-light">
                                            <div className="small text-muted mb-1">Max Complexity</div>
                                            <h4 className="fw-bold text-dark mb-0">{formatValue(summary.max_complexity)}</h4>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="border rounded p-2 text-center bg-light">
                                            <div className="small text-muted mb-1">Hotspots</div>
                                            <h4 className="fw-bold text-danger mb-0">{summary.hotspot_count ?? 0}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {fileFeatures && (
                            <div className="card p-3 border shadow-sm bg-white">
                                <h6 className="fw-bold mb-3 text-dark">File-Level Structural Metrics</h6>
                                <div className="row g-2">
                                    <div className="col-6 col-md-4">
                                        <div className="border-start border-3 border-secondary ps-2 mb-2">
                                            <div className="small text-muted d-flex align-items-center gap-1">
                                                Cyclomatic CC
                                            </div>
                                            <div className="fw-bold">{formatValue(fileFeatures.cyclomatic_complexity)}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <div className="border-start border-3 border-secondary ps-2 mb-2">
                                            <div className="small text-muted">Max Nesting</div>
                                            <div className="fw-bold">{formatValue(fileFeatures.max_nesting_depth)}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <div className="border-start border-3 border-secondary ps-2 mb-2">
                                            <div className="small text-muted">Loops count</div>
                                            <div className="fw-bold">{formatValue(fileFeatures.loop_count)}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <div className="border-start border-3 border-secondary ps-2 mb-2">
                                            <div className="small text-muted">Comprehensions</div>
                                            <div className="fw-bold">{formatValue(fileFeatures.comprehension_count)}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <div className="border-start border-3 border-secondary ps-2 mb-2">
                                            <div className="small text-muted">Is Recursive</div>
                                            <div className="fw-bold">{fileFeatures.is_recursive ? "Yes" : "No"}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <div className="border-start border-3 border-secondary ps-2 mb-2">
                                            <div className="small text-muted">Builtins Called</div>
                                            <div className="fw-bold">{formatValue(fileFeatures.builtin_call_count)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card p-3 border shadow-sm bg-white">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                                <Lightbulb className="text-warning" size={18} />
                                Refactoring Recommendations
                            </h6>
                            <div className="d-flex flex-column gap-2">
                                {recommendations.map((recommendation, index) => (
                                    <div key={index} className={`alert alert-${recommendation.type} border-0 mb-0 py-2 px-3 small d-flex gap-2 align-items-start`}>
                                        {recommendation.type === "danger" ? <AlertTriangle size={16} className="mt-1 flex-shrink-0" /> : <Info size={16} className="mt-1 flex-shrink-0" />}
                                        <div>
                                            <strong>{recommendation.title}: </strong>
                                            <span dangerouslySetInnerHTML={{ __html: recommendation.message }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Functions Tab */}
                {activeTab === "functions" && (
                    <div className="d-flex flex-column gap-3 animate-fade-in">
                        {functions.length > 0 ? (
                            <>
                                <FunctionTable 
                                    functions={functions}
                                    selectedFunction={selectedFunction}
                                    onSelectFunction={onSelectFunction}
                                />

                                {selectedFunctionDetails ? (
                                    <div className="card border-primary p-3 bg-white border shadow-sm">
                                        <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
                                            <div>
                                                <h6 className="fw-bold mb-0 text-primary font-monospace">
                                                    def {selectedFunctionDetails.name}()
                                                </h6>
                                                <small className="text-muted">Line {selectedFunctionDetails.line} • {selectedFunctionMetrics?.lines_of_code} Estimated LOC</small>
                                            </div>
                                            <span className={`badge ${getRiskBadgeClass(selectedFunctionDetails.risk_level)}`}>
                                                CC Severity: {selectedFunctionDetails.risk_level}
                                            </span>
                                        </div>

                                        <div className="row g-2 mb-3">
                                            <div className="col-12 col-md-6">
                                                <div className="p-2 border rounded bg-light">
                                                    <span className="small text-muted d-block fw-semibold">Cyclomatic Complexity ({selectedFunctionDetails.cyclomatic_complexity})</span>
                                                    <span className="small text-dark">{getMetricInsight("cyclomatic_complexity", selectedFunctionDetails.cyclomatic_complexity)}</span>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <div className="p-2 border rounded bg-light">
                                                    <span className="small text-muted d-block fw-semibold">Maintainability Index ({selectedFunctionMetrics?.maintainability_index}/100)</span>
                                                    <span className="small text-dark">{getMetricInsight("maintainability_index", selectedFunctionMetrics?.maintainability_index)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <h6 className="small fw-bold text-dark mb-2">Halstead Complexity Breakdown</h6>
                                        <div className="row row-cols-2 row-cols-md-5 g-2 mb-3 text-center">
                                            <div className="col">
                                                <div className="border rounded py-1 px-2 bg-light">
                                                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>Vocabulary</div>
                                                    <div className="fw-bold">{selectedFunctionDetails.halstead_vocabulary}</div>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="border rounded py-1 px-2 bg-light">
                                                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>Length</div>
                                                    <div className="fw-bold">{selectedFunctionDetails.halstead_length}</div>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="border rounded py-1 px-2 bg-light">
                                                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>Difficulty</div>
                                                    <div className="fw-bold">{formatValue(selectedFunctionDetails.halstead_difficulty)}</div>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="border rounded py-1 px-2 bg-light">
                                                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>Volume</div>
                                                    <div className="fw-bold">{formatValue(selectedFunctionDetails.halstead_volume)}</div>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="border rounded py-1 px-2 bg-light">
                                                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>Effort</div>
                                                    <div className="fw-bold">{formatValue(selectedFunctionMetrics?.halstead_effort)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row g-2 small text-muted">
                                            <div className="col-12 col-sm-6">
                                                <div><strong>Nesting Depth:</strong> {selectedFunctionDetails.max_nesting_depth} (Max Loop Nesting: {selectedFunctionDetails.max_loop_depth})</div>
                                                <div><strong>Loops count:</strong> {selectedFunctionDetails.loop_count}</div>
                                                <div><strong>Is Recursive:</strong> {selectedFunctionDetails.is_recursive ? "Yes" : "No"}</div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div><strong>Big-O Prediction:</strong> <span className="font-monospace text-primary fw-semibold">{selectedFunctionDetails.big_o || "—"}</span></div>
                                                {selectedFunctionDetails.big_o_confidence && (
                                                    <div><strong>Prediction Confidence:</strong> {(selectedFunctionDetails.big_o_confidence * 100).toFixed(0)}%</div>
                                                )}
                                                <div><strong>Comprehensions count:</strong> {selectedFunctionDetails.comprehension_count}</div>
                                            </div>
                                        </div>

                                        {selectedFunctionDetails.unique_builtin_calls?.length > 0 && (
                                            <div className="mt-3">
                                                <span className="small d-block text-muted fw-semibold mb-1">Built-in Python functions called:</span>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {selectedFunctionDetails.unique_builtin_calls.map((fn, idx) => (
                                                        <span key={idx} className="badge bg-secondary font-monospace" style={{ fontSize: "0.75rem" }}>
                                                            {fn}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted bg-light rounded border border-dashed">
                                        Click on a function in the table above to view a detailed breakdown of its metrics and quality insights.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-muted small">No functions were detected in this file.</div>
                        )}
                    </div>
                )}

                {/* Graph Tab */}
                {activeTab === "call_graph" && (
                    <div className="animate-fade-in">
                        <CallGraph 
                            callGraph={callGraph}
                            functions={functions}
                            selectedFunction={selectedFunction}
                            onSelectFunction={onSelectFunction}
                        />
                    </div>
                )}

                {/* Metrics Tab */}
                {activeTab === "metrics" && (
                    <div className="animate-fade-in">
                        <MetricsPanel response={response} />
                    </div>
                )}

            </div>
        </div>
    );
}