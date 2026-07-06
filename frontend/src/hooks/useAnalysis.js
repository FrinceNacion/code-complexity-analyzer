import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export function useAnalysis() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    async function analyze(fileInfo) {
        const form = new FormData();
        form.append("file", fileInfo.file);

        try {
            const response = await fetch(`${API_URL}/api/analyze`, {
                method: "POST",
                contentType: "multipart/form-data",
                body: form,
            });

            if (!response.ok) {
                const error_data = await response.json();
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
            setError(null);
            return data;
        } catch (error) {
            setResult(null);
            setError(error.message);
        }
    }

    return { result, error, analyze };
}