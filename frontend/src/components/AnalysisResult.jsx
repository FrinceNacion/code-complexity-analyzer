import React from "react";
import { formatValue, getRiskBadgeClass } from "./utils/formatters";

export default function AnalysisResult({ response, selectedFunction, onSelectFunction }) {
    const [activeTab, setActiveTab] = useState("overview");

    const fileName = response?.file_name ?? "Unknown";
    const summary = response?.summary ?? null;
    const fileFeatures = response?.file_features ?? null;
    const functions = Array.isArray(response?.functions) ? response.functions : [];
    const callGraph = response?.call_graph ?? { nodes: [], edges: [] };

    return (
        <div>
            <div className="mb-3">
                <h6 className="fw-bold">File</h6>
                <div className="text-muted">{fileName}</div>
            </div>

            {summary ? (
                <div className="mb-3">
                    <h6 className="fw-bold">Summary</h6>
                    <div className="row g-2">
                        <div className="col-6 col-md-3">
                            <div className="border rounded p-2 h-100">
                                <div className="small text-muted">Functions</div>
                                <div className="fw-semibold">{summary.total_functions ?? 0}</div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="border rounded p-2 h-100">
                                <div className="small text-muted">Avg complexity</div>
                                <div className="fw-semibold">{formatValue(summary.avg_complexity)}</div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="border rounded p-2 h-100">
                                <div className="small text-muted">Max complexity</div>
                                <div className="fw-semibold">{formatValue(summary.max_complexity)}</div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="border rounded p-2 h-100">
                                <div className="small text-muted">Hotspot/s</div>
                                <div className="fw-semibold">{summary.hotspot_count ?? 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {fileFeatures ? (
                <div className="mb-3">
                    <h6 className="fw-bold">File Metrics</h6>
                    <div className="row g-2">
                        <div className="col-6 col-md-4">
                            <div className="small text-muted">Cyclomatic</div>
                            <div>{formatValue(fileFeatures.cyclomatic_complexity)}</div>
                        </div>
                        <div className="col-6 col-md-4">
                            <div className="small text-muted">Max nesting</div>
                            <div>{formatValue(fileFeatures.max_nesting_depth)}</div>
                        </div>
                        <div className="col-6 col-md-4">
                            <div className="small text-muted">Loop count</div>
                            <div>{formatValue(fileFeatures.loop_count)}</div>
                        </div>
                        <div className="col-6 col-md-4">
                            <div className="small text-muted">Comprehensions</div>
                            <div>{formatValue(fileFeatures.comprehension_count)}</div>
                        </div>
                        <div className="col-6 col-md-4">
                            <div className="small text-muted">Recursive</div>
                            <div>{fileFeatures.is_recursive ? "Yes" : "No"}</div>
                        </div>
                        <div className="col-6 col-md-4">
                            <div className="small text-muted">Builtins</div>
                            <div>{formatValue(fileFeatures.builtin_call_count)}</div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="mb-3">
                <h6 className="fw-bold">Call Graph</h6>
                <div className="small text-muted">
                    {callGraph?.nodes?.length ?? 0} nodes • {(callGraph?.edges?.length ?? 0)} edges
                </div>
            </div>

            {functions.length > 0 ? (
                <div>
                    <h6 className="fw-bold">Functions</h6>
                    <div className="d-md-none">
                        <div className="d-flex flex-column gap-2">
                            {functions.map((fn, index) => (
                                <div key={`${fn.name}-${index}`} className="border rounded p-2">
                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                        <div>
                                            <div className="fw-semibold">{fn.name}</div>
                                            <div className="small text-muted">Line {fn.line}</div>
                                        </div>
                                        <span className={`badge ${getRiskBadgeClass(fn.risk_level)}`}>
                                            {fn.risk_level ?? "unknown"}
                                        </span>
                                    </div>
                                    <div className="row g-2 mt-2 small text-muted">
                                        <div className="col-6 col-md-3">
                                            <strong>CC:</strong> {formatValue(fn.cyclomatic_complexity)}
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <strong>Loops:</strong> {formatValue(fn.loop_count)}
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <strong>Big-O:</strong> {formatValue(fn.big_o) || "—"}
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <strong>Halstead:</strong> {formatValue(fn.halstead_volume)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="d-none d-md-block">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Line</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Complexity</th>
                                    <th scope="col">Loops</th>
                                    <th scope="col">Big-O</th>
                                    <th scope="col">Halstead</th>
                                    <th scope="col">Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {functions.map((fn, index) => (
                                    <tr key={`${fn.name}-${index}`}>
                                        <th scope="row">{fn.line}</th>
                                        <td>{fn.name}</td>
                                        <td>{formatValue(fn.cyclomatic_complexity)}</td>
                                        <td>{formatValue(fn.loop_count)}</td>
                                        <td>{formatValue(fn.big_o) || "—"}</td>
                                        <td>{formatValue(fn.halstead_volume)}</td>
                                        <td>
                                            <span className={`badge ${getRiskBadgeClass(fn.risk_level)}`}>
                                                {fn.risk_level ?? "unknown"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-muted small">No functions were detected in this file.</div>
            )}
        </div>
    )
}