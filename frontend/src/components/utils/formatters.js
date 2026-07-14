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