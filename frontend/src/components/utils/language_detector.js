import hljs from "highlight.js";

export function detectLangaugeFromFile(filename) {
    if (!filename) return "plaintext";
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "py") return "python";
    if (ext === "js") return "javascript";
    if (ext === "ts") return "typescript";
    return "plaintext";
}

export async function detectLanguageFromString(raw_code) {
    const result = hljs.highlightAuto(raw_code) 
    console.log(result.language)
    return result.language
}