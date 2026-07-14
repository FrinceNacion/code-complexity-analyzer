export const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "number") {
        return Number.isInteger(value) ? value : value.toFixed(2);
    }
    return value;
};

export const getRiskBadgeClass = (risk) => {
    switch (risk) {
        case "critical":
            return "bg-danger";
        case "high":
            return "bg-warning text-dark";
        case "medium":
            return "bg-info text-dark";
        default:
            return "bg-success";
    }
};

export const getSeverity = (metricName, value) => {
    if (value === null || value === undefined) {
        return { level: "good", color: "#22c55e", badgeClass: "bg-success", label: "Good" };
    }

    switch (metricName) {
        case "cyclomatic_complexity":
            if (value <= 4) return { level: "good", color: "#22c55e", badgeClass: "bg-success", label: "Good" };
            if (value <= 7) return { level: "moderate", color: "#0ea5e9", badgeClass: "bg-info text-dark", label: "Moderate" };
            if (value <= 10) return { level: "high", color: "#f59e0b", badgeClass: "bg-warning text-dark", label: "High" };
            return { level: "critical", color: "#ef4444", badgeClass: "bg-danger", label: "Critical" };

        case "max_nesting_depth":
        case "max_loop_depth":
            if (value <= 2) return { level: "good", color: "#22c55e", badgeClass: "bg-success", label: "Good" };
            if (value <= 4) return { level: "moderate", color: "#0ea5e9", badgeClass: "bg-info text-dark", label: "Moderate" };
            if (value <= 6) return { level: "high", color: "#f59e0b", badgeClass: "bg-warning text-dark", label: "High" };
            return { level: "critical", color: "#ef4444", badgeClass: "bg-danger", label: "Critical" };

        case "loop_count":
            if (value <= 2) return { level: "good", color: "#22c55e", badgeClass: "bg-success", label: "Good" };
            if (value <= 4) return { level: "moderate", color: "#0ea5e9", badgeClass: "bg-info text-dark", label: "Moderate" };
            if (value <= 6) return { level: "high", color: "#f59e0b", badgeClass: "bg-warning text-dark", label: "High" };
            return { level: "critical", color: "#ef4444", badgeClass: "bg-danger", label: "Critical" };

        case "halstead_volume":
            if (value <= 1000) return { level: "good", color: "#22c55e", badgeClass: "bg-success", label: "Good" };
            if (value <= 3000) return { level: "moderate", color: "#0ea5e9", badgeClass: "bg-info text-dark", label: "Moderate" };
            if (value <= 8000) return { level: "high", color: "#f59e0b", badgeClass: "bg-warning text-dark", label: "High" };
            return { level: "critical", color: "#ef4444", badgeClass: "bg-danger", label: "Critical" };

        case "maintainability_index":
            if (value >= 80) return { level: "good", color: "#22c55e", badgeClass: "bg-success", label: "Good" };
            if (value >= 65) return { level: "moderate", color: "#0ea5e9", badgeClass: "bg-info text-dark", label: "Moderate" };
            if (value >= 50) return { level: "high", color: "#f59e0b", badgeClass: "bg-warning text-dark", label: "High" };
            return { level: "critical", color: "#ef4444", badgeClass: "bg-danger", label: "Critical" };

        default:
            return { level: "good", color: "#22c55e", badgeClass: "bg-success", label: "Good" };
    }
};

export const getMetricDescription = (metricName) => {
    switch (metricName) {
        case "cyclomatic_complexity":
            return "Measures the number of independent code execution paths. High complexity makes testing and understanding difficult.";
        case "max_nesting_depth":
            return "The deepest nesting level of control structures (if, loops, try). Deep nesting increases cognitive complexity.";
        case "max_loop_depth":
            return "The maximum nesting level of loops within loops. High loop nesting can cause performance bottlenecks.";
        case "loop_count":
            return "Total number of loop blocks (for, while) within the code.";
        case "comprehension_count":
            return "Number of comprehensions (list, set, dict). Simplifies code but high usage can be tricky to scan.";
        case "is_recursive":
            return "Whether the function calls itself directly or indirectly.";
        case "builtin_call_count":
            return "Total number of calls made to Python built-in functions.";
        case "unique_builtin_calls":
            return "The distinct set of Python built-in functions invoked.";
        case "halstead_vocabulary":
            return "Sum of distinct operators and distinct operands (n1 + n2).";
        case "halstead_length":
            return "Total number of operator and operand occurrences (N1 + N2).";
        case "halstead_difficulty":
            return "Difficulty to write/understand the code. Proportional to operators count and operand reuse.";
        case "halstead_volume":
            return "The overall information content or size of the function.";
        case "halstead_effort":
            return "Mental effort required to write or understand the code. (Volume × Difficulty)";
        case "maintainability_index":
            return "An index between 0 and 100 measuring code maintainability. Higher values indicate cleaner, more readable code.";
        case "lines_of_code":
            return "The estimated logical Lines of Code (LOC) derived from program elements.";
        default:
            return "N/A";
    }
};