const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export function useAnalysis() {
    async function analyze(fileInfo) {
        const form = new FormData();
        form.append("file", fileInfo.file);

        try {
            const response = await fetch(`${API_URL}/api/analyze`, {
                method: "POST",
                body: form,
                
            });

            if (!response.ok) {
                const error_data = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${error_data?.detail || ""}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Failed to analyze file: ${error.message}`, { cause: error });
        }
    }

    return { analyze };
}