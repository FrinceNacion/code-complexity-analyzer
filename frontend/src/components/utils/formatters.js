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