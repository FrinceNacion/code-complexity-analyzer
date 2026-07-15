import { useMemo, useState, Fragment } from "react";
import { formatValue, getRiskBadgeClass, computeFunctionMetrics, getSeverity } from "./utils/formatters";

export default function FunctionTable({ functions, selectedFunction, onSelectFunction }) {
    const [sortConfig, setSortConfig] = useState({ key: "line", direction: "asc" });

    const processedFunctions = useMemo(() => {
        return functions.map((fn) => {
            const computed = computeFunctionMetrics(fn);
            return {
                ...fn,
                lines_of_code: computed.lines_of_code,
                maintainability_index: computed.maintainability_index,
                halstead_effort: computed.halstead_effort,
            };
        });
    }, [functions]);

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedFunctions = useMemo(() => {
        return [...processedFunctions].sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;

            if (typeof valA === "string") {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
            if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;

            // Stable fallback sort using declaration order (line number)
            return a.line - b.line;
        });
    }, [processedFunctions, sortConfig]);

    const getSortClass = (key) => {
        return sortConfig.key === key ? "text-primary fw-bold" : "text-muted";
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return "▲▼";
        return sortConfig.direction === "asc" ? "▲" : "▼";
    };

    const columns = [
        { key: "line", label: "Line" },
        { key: "name", label: "Function Name" },
        { key: "cyclomatic_complexity", label: "Complexity (CC)" },
        { key: "maintainability_index", label: "Maintainability (MI)" },
        //{ key: "halstead_volume", label: "Volume (HV)" },
        //{ key: "halstead_difficulty", label: "Difficulty (HD)" },
        //{ key: "halstead_effort", label: "Effort (HE)" },
        //{ key: "max_nesting_depth", label: "Nesting (ND)" },
        //{ key: "lines_of_code", label: "LOC (Est)" }
    ];

    return (
        <div>
            {/* Mobile View: Cards Layout */}
            <div className="d-md-none">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small fw-semibold text-muted">Sort by:</span>
                    <select
                        className="form-select form-select-sm w-50"
                        value={`${sortConfig.key}-${sortConfig.direction}`}
                        onChange={(e) => {
                            const [key, direction] = e.target.value.split("-");
                            setSortConfig({ key, direction });
                        }}
                    >
                        {columns.map(col => (
                            <Fragment key={col.key}>
                                <option value={`${col.key}-asc`}>{col.label} (Asc)</option>
                                <option value={`${col.key}-desc`}>{col.label} (Desc)</option>
                            </Fragment>
                        ))}
                    </select>
                </div>
                <div className="d-flex flex-column gap-2">
                    {sortedFunctions.map((fn, index) => {
                        const isSelected = selectedFunction && selectedFunction.name === fn.name;
                        const miSeverity = getSeverity("maintainability_index", fn.maintainability_index);
                        return (
                            <div
                                key={`${fn.name}-${index}`}
                                className={`border rounded p-3 cursor-pointer transition-all ${isSelected ? 'border-primary bg-light shadow-sm' : 'bg-white'}`}
                                onClick={() => onSelectFunction(fn)}
                                style={{ cursor: "pointer" }}
                                role="button"
                            >
                                <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                        <div className="fw-bold text-dark">{fn.name}</div>
                                        <div className="small text-muted">Line {fn.line} • {fn.lines_of_code} LOC</div>
                                    </div>
                                    <div className="d-flex gap-1">
                                        <span className={`badge ${getRiskBadgeClass(fn.risk_level)}`}>
                                            CC: {fn.cyclomatic_complexity}
                                        </span>
                                        <span className={`badge ${miSeverity.badgeClass}`}>
                                            MI: {fn.maintainability_index}
                                        </span>
                                    </div>
                                </div>
                                <div className="row g-2 mt-2 pt-2 border-top small text-muted">
                                    <div className="col-4">
                                        <strong>Nesting:</strong> {fn.max_nesting_depth}
                                    </div>
                                    <div className="col-4">
                                        <strong>Volume:</strong> {formatValue(fn.halstead_volume)}
                                    </div>
                                    <div className="col-4">
                                        <strong>Effort:</strong> {formatValue(fn.halstead_effort)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Desktop View: Table Layout */}
            <div className="d-none d-md-block overflow-x-auto">
                <table className="table table-hover align-middle border rounded overflow-hidden">
                    <thead className="table-light">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    onClick={() => requestSort(col.key)}
                                    style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                                    className="small py-3"
                                >
                                    <div className="d-flex align-items-center gap-1">
                                        <span className={getSortClass(col.key)}>{col.label}</span>
                                        <span className="small text-muted" style={{ fontSize: "0.65rem" }}>
                                            {getSortIndicator(col.key)}
                                        </span>
                                    </div>
                                </th>
                            ))}
                            <th scope="col" className="small py-3">Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedFunctions.map((fn, index) => {
                            const isSelected = selectedFunction && selectedFunction.name === fn.name;
                            const miSeverity = getSeverity("maintainability_index", fn.maintainability_index);
                            return (
                                <tr
                                    key={`${fn.name}-${index}`}
                                    onClick={() => onSelectFunction(fn)}
                                    className={`${isSelected ? "table-active fw-semibold border-start border-primary border-4" : ""}`}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td className="text-muted small">{fn.line}</td>
                                    <td>
                                        <span className="text-primary font-monospace">{fn.name}</span>
                                    </td>
                                    <td>
                                        <span className="badge bg-light text-dark border">
                                            {fn.cyclomatic_complexity}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${miSeverity.badgeClass}`}>
                                            {fn.maintainability_index}
                                        </span>
                                    </td>
                                    {/*<td>{formatValue(fn.halstead_volume)}</td>
                                    <td>{formatValue(fn.halstead_difficulty)}</td>
                                    <td>{formatValue(fn.halstead_effort)}</td>
                                    <td>{fn.max_nesting_depth}</td>
                                    <td>{fn.lines_of_code}</td>*/}
                                    <td>
                                        <span className={`badge ${getRiskBadgeClass(fn.risk_level)}`}>
                                            {fn.risk_level}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
