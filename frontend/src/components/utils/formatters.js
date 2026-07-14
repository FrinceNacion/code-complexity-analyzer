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

export const getMetricInsight = (metricName, value) => {
    if (value === null || value === undefined) return "";
    switch (metricName) {
        case "cyclomatic_complexity":
            if (value <= 4) return "Simple execution structure, extremely easy to test and maintain.";
            if (value <= 7) return "Moderate complexity. Easy to manage but contains a few branching paths.";
            if (value <= 10) return "High complexity. Contains multiple decision paths; keep an eye on complexity growth.";
            return "Critical complexity. Very high risk of bugs; highly recommended to refactor into smaller helper functions.";

        case "maintainability_index":
            if (value >= 80) return "Excellent maintainability. Clean, readable, and highly maintainable.";
            if (value >= 65) return "Good maintainability. Code is reasonably readable, but could benefit from minor cleanup.";
            if (value >= 50) return "Low maintainability. Somewhat hard to read or edit. Bugs are more likely to hide here.";
            return "Critical maintainability. Very difficult to maintain. High risk of technical debt. Immediate refactor suggested.";

        case "max_nesting_depth":
            if (value <= 2) return "Low nesting level. Straightforward logic flow.";
            if (value <= 4) return "Moderate nesting level. Some nested control flows are present.";
            return "Deep nesting level. High cognitive load; consider using guard clauses or early exits to flatten the code.";

        default:
            return "";
    }
};

export const computeFunctionMetrics = (fn) => {
    const cyclomatic_complexity = fn.cyclomatic_complexity ?? 1;
    const halstead_volume = fn.halstead_volume ?? 0;
    const halstead_length = fn.halstead_length ?? 0;
    const lines_of_code = Math.max(1, Math.round(halstead_length / 5));  // estimated LOC

    // Maintainability Index formula: 171 - 5.2 * ln(Vol) - 0.23 * CC - 16.2 * ln(LOC)
    const volume_log = halstead_volume > 0 ? Math.log(halstead_volume) : 0;
    const lines_of_code_log = Math.log(lines_of_code);
    
    let raw_maintainability_index = 171 - 5.2 * volume_log - 0.23 * cyclomatic_complexity - 16.2 * lines_of_code_log;
    let maintainability_index = Math.max(0, Math.min(100, (raw_maintainability_index * 100) / 171));

    // Calculate Halstead Effort
    const halstead_effort = (fn.halstead_volume ?? 0) * (fn.halstead_difficulty ?? 0);

    return {
        lines_of_code: lines_of_code,
        maintainability_index: Math.round(maintainability_index),
        halstead_effort: Math.round(halstead_effort),
    };
};

export const computeProjectMetrics = (response) => {
    const summary = response?.summary ?? {};
    const functions = Array.isArray(response?.functions) ? response.functions : [];
    const file_line_of_code = Math.max(1, Math.round((response?.file_features?.halstead_length ?? 0) / 5));
    
    if (functions.length === 0) {
        return {
            total_functions: 0,
            avg_complexity: 0,
            max_complexity: 0,
            avg_maintainability: 100,
            avg_halstead_volume: 0,
            max_nesting_depth: response?.file_features?.max_nesting_depth ?? 0,
            total_loc: file_line_of_code,
            rating: "A",
            ratingColor: "#22c55e",
        };
    }

    let total_maintainability_index = 0;
    let total_volume = 0;
    let max_nesting = 0;
    
    functions.forEach(fn => {
        const computed = computeFunctionMetrics(fn);
        total_maintainability_index += computed.maintainability_index;
        total_volume += fn.halstead_volume ?? 0;
        max_nesting = Math.max(max_nesting, fn.max_nesting_depth ?? 0);
    });

    const total_functions = functions.length;
    const average_maintainability = Math.round(total_maintainability_index / total_functions);
    const average_volume = total_volume / total_functions;

    // Project rating based on Maintainability Index
    let rating;
    let ratingColor;
    if (average_maintainability >= 85) {
        rating = "A";
        ratingColor = "#22c55e";
    } else if (average_maintainability >= 70) {
        rating = "B";
        ratingColor = "#3b82f6";
    } else if (average_maintainability >= 55) {
        rating = "C";
        ratingColor = "#eab308";
    } else if (average_maintainability >= 40) {
        rating = "D";
        ratingColor = "#f97316";
    } else {
        rating = "F";
        ratingColor = "#ef4444";
    }

    return {
        total_functions: total_functions,
        avg_complexity: summary.avg_complexity ?? 0,
        max_complexity: summary.max_complexity ?? 0,
        avg_maintainability: average_maintainability,
        avg_halstead_volume: average_volume,
        max_nesting_depth: Math.max(max_nesting, response?.file_features?.max_nesting_depth ?? 0),
        total_loc: file_line_of_code,
        rating,
        ratingColor,
    };
};