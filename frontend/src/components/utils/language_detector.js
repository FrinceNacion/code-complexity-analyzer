import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";

export function detectLanguageFromFile(filename) {
    if (!filename) return "plaintext";
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "py") return "python";
    if (ext === "js") return "javascript";
    if (ext === "ts") return "typescript";
    return "plaintext";
}

export async function detectLanguageFromString(raw_code) {
    hljs.registerLanguage("python", python);
    hljs.registerLanguage("javascript", javascript);
    hljs.registerLanguage("typescript", typescript);

    const result = hljs.highlightAuto(raw_code)
    console.log(result.language)
    return result.language
}