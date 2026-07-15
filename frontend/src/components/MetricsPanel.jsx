import {
    computeProjectMetrics,
    getSeverity,
    formatValue
} from "./utils/formatters";
import {
    Binary,
    GitBranch,
    Flame,
    Activity,
    Database,
    Layers,
    Hash,
    Award
} from "lucide-react";

export default function MetricsPanel({ response }) {
    const metrics = computeProjectMetrics(response);

    const cards = [
        {
            key: "rating",
            label: "Overall Health Rating",
            value: metrics.rating,
            icon: Award,
            color: metrics.ratingColor,
            bgColor: `${metrics.ratingColor}15`,
            explanation: `Grade derived from average maintainability index score of ${metrics.avg_maintainability}/100.`,
            badge: true,
        },
        {
            key: "total_functions",
            label: "Total Functions",
            value: metrics.total_functions,
            icon: Binary,
            color: "#6366f1",
            bgColor: "#6366f115",
            explanation: "The count of functions defined in the selected file.",
        },
        {
            key: "avg_complexity",
            label: "Avg Cyclomatic Complexity",
            value: formatValue(metrics.avg_complexity),
            icon: GitBranch,
            ...getSeverityCardProps("cyclomatic_complexity", metrics.avg_complexity),
            explanation: "Average branch count. A higher average implies code is generally harder to test.",
            progress: {
                value: Math.min(100, (metrics.avg_complexity / 15) * 100),
                label: `Target: < 4`
            }
        },
        {
            key: "max_complexity",
            label: "Max Cyclomatic Complexity",
            value: metrics.max_complexity,
            icon: Flame,
            ...getSeverityCardProps("cyclomatic_complexity", metrics.max_complexity),
            explanation: "The complexity score of the single most complex function in the file.",
            progress: {
                value: Math.min(100, (metrics.max_complexity / 20) * 100),
                label: `High risk: > 10`
            }
        },
        {
            key: "avg_maintainability",
            label: "Avg Maintainability Index",
            value: `${metrics.avg_maintainability}/100`,
            icon: Activity,
            ...getSeverityCardProps("maintainability_index", metrics.avg_maintainability),
            explanation: "Calculated from Halstead metrics and Complexity. Higher is better.",
            progress: {
                value: metrics.avg_maintainability,
                label: `Good: > 80`
            }
        },
        {
            key: "avg_halstead_volume",
            label: "Avg Halstead Volume",
            value: formatValue(metrics.avg_halstead_volume),
            icon: Database,
            ...getSeverityCardProps("halstead_volume", metrics.avg_halstead_volume),
            explanation: "Measures overall information content based on operators & operands.",
        },
        {
            key: "max_nesting_depth",
            label: "Max Nesting Depth",
            value: metrics.max_nesting_depth,
            icon: Layers,
            ...getSeverityCardProps("max_nesting_depth", metrics.max_nesting_depth),
            explanation: "Deepest control structure nesting level. Target is <= 2 to keep code readable.",
            progress: {
                value: Math.min(100, (metrics.max_nesting_depth / 8) * 100),
                label: `Target: <= 2`
            }
        },
        {
            key: "total_loc",
            label: "Logical Lines of Code",
            value: metrics.total_loc,
            icon: Hash,
            color: "#0ea5e9",
            bgColor: "#0ea5e915",
            explanation: "Logical program length estimated via distinct vocabulary elements.",
        }
    ];

    function getSeverityCardProps(metric, val) {
        const severity = getSeverity(metric, val);
        return {
            color: severity.color,
            bgColor: `${severity.color}15`,
            borderClass: `border-start border-4 border-${severity.level}`
        };
    }

    return (
        <div className="overflow-x-hidden">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>
                    <h6 className="fw-bold mb-0 text-dark">Code Quality Dashboard</h6>
                    <small className="text-muted">Overview of the codebase metrics, maintainability indexes and quality trends.</small>
                </div>
            </div>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
                {cards.map((card) => {
                    const IconComponent = card.icon;
                    return (
                        <div key={card.key} className="col">
                            <div
                                className="card h-100 p-3 shadow-sm border position-relative overflow-hidden"
                                style={{
                                    borderLeft: `4px solid ${card.color}`,
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-muted small fw-semibold text-uppercase tracking-wider">{card.label}</span>
                                    <div
                                        className="rounded-circle d-lg-none d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 32,
                                            height: 32,
                                            backgroundColor: card.bgColor,
                                            color: card.color
                                        }}
                                    >
                                        <IconComponent size={16} />
                                    </div>
                                </div>
                                <div className="mb-2">
                                    {card.badge ? (
                                        <span
                                            className="display-6 fw-bold"
                                            style={{ color: card.color }}
                                        >
                                            {card.value}
                                        </span>
                                    ) : (
                                        <h3 className="fw-bold mb-0 text-dark">{card.value}</h3>
                                    )}
                                </div>

                                {card.progress && (
                                    <div className="mb-2">
                                        <div className="progress" style={{ height: "4px", backgroundColor: "#e2e8f0" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{
                                                    width: `${card.progress.value}%`,
                                                    backgroundColor: card.color
                                                }}
                                                aria-valuenow={card.progress.value}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-1" style={{ fontSize: "0.7rem" }}>
                                            <span className="text-muted">{card.progress.label}</span>
                                        </div>
                                    </div>
                                )}

                                <p className="mb-0 text-muted small mt-auto" style={{ fontSize: "0.78rem" }}>
                                    {card.explanation}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* General Advice box */}
            <div className="card mt-4 p-3 bg-light border shadow-sm">
                <h6 className="fw-bold text-dark mb-2">How to read these metrics:</h6>
                <div className="row g-3 text-muted small">
                    <div className="col-12 col-md-6">
                        <div className="mb-2">
                            <strong>Rating & Maintainability Index:</strong>
                            <p className="mb-0">Values above 85 are excellent. Scores below 65 indicate complexity problems that should be looked into, and below 50 means immediate refactoring is advised.</p>
                        </div>
                        <div>
                            <strong>Nesting Depth:</strong>
                            <p className="mb-0">Deep nesting suggests nested <code>if</code> statements, <code>for</code>/<code>while</code> loops. Use guard clauses to exit early and keep code flat.</p>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="mb-2">
                            <strong>Cyclomatic Complexity (CC):</strong>
                            <p className="mb-0">Measures execution paths. High complexity (CC &gt; 10) means there are too many branches, meaning more unit tests are needed and code is hard to reason about.</p>
                        </div>
                        <div>
                            <strong>Halstead volume:</strong>
                            <p className="mb-0">Measures the overall information weight of the function based on vocabulary and operators size.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
