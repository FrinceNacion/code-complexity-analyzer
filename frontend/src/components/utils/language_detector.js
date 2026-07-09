
export function detectLanguage(filename) {
    if (!filename) return "plaintext";
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "py") return "python";
    if (ext === "js") return "javascript";
    if (ext === "ts") return "typescript";
    return "plaintext";
}