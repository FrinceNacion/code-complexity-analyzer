import React, { useRef, useState, useCallback } from "react";
import { Upload } from 'lucide-react';

const ACCEPTED = [".py", ".js", ".ts", ".tsx"];
const MAX_FILE_SIZE = 5 * 1024; // 500 KB in bytes

function detectLanguage(filename) {
    if (!filename) return "plaintext";
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "py") return "python";
    if (ext === "js") return "javascript";
    if (ext === "ts") return "typescript";
    if (ext === "jsx") return "javascript";
    if (ext === "tsx") return "typescript";
    return "plaintext";
}

export default function UploadZone({ onFileSelect }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileInfo, setFileInfo] = useState(null);
    const [exceedSizeError, setExceedSizeError] = useState(false);
    const [zeroSizeError, setZeroSizeError] = useState(false);

    const openPicker = () => inputRef.current?.click();

    const clearFile = () => {
        setFileInfo(null);
        if (onFileSelect) onFileSelect(null);
    };

    const handleFiles = useCallback((files) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        const size = file.size || 0;

        if (size === 0) {
            setZeroSizeError(true);
            setTimeout(() => setZeroSizeError(false), 3000); // Hide error after 3 seconds
            return;
        }

        if (size > MAX_FILE_SIZE) {
            setExceedSizeError(true);
            setTimeout(() => setExceedSizeError(false), 3000); // Hide error after 3 seconds
            return;
        }

        const name = file.name || "untitled";

        const language = detectLanguage(name);
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;
            const info = { file, name, size, language, content };
            setFileInfo(info);
            onFileSelect && onFileSelect(info);
        };
        reader.readAsText(file);
    }, [onFileSelect]);

    const onInputChange = (e) => handleFiles(e.target.files);

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div>
            <div class={`alert alert-danger ${exceedSizeError ? 'd-block' : 'd-none'}`} role="alert">
                File size exceeds 500 KB limit. Please upload a smaller file.
            </div>
            <div class={`alert alert-danger ${zeroSizeError ? 'd-block' : 'd-none'}`} role="alert">
                File size is zero. Please upload a valid file.
            </div>
            <div
                className={`d-flex flex-column align-items-center justify-content-center p-4 rounded 
                    ${zeroSizeError || exceedSizeError ? 'border-danger' : ''} 
                    border-1 border-dashed text-center bg-white" 
                    ${dragOver ? 'border-primary bg-light' : ''}`}
                onClick={openPicker}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                style={{ minHeight: 140, cursor: "pointer", borderStyle: "dashed" }}
                role="button"
            >
                <input ref={inputRef} type="file" className="d-none" onChange={onInputChange} accept={ACCEPTED.join(",")} />
                <div className="mb-2">
                    <Upload size={32} />
                </div>
                <div>
                    <h6 className="mb-1">Drag & Drop your source code here</h6>
                    <p className="mb-0 text-body-secondary text-muted">Or click to browse — accepts .py, .js, .ts, .tsx (max: 500 KB)</p>
                </div>
            </div>

            {fileInfo ? (
                <div className="card m-0 mt-3 p-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <div className="fw-bold">{fileInfo.name}</div>
                            <div className="text-muted small">{(fileInfo.size / 1024).toFixed(2)} KB • {fileInfo.language}</div>
                        </div>
                        <div>
                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => navigator.clipboard?.writeText(fileInfo.name)}>Copy Name</button>
                            <button className="btn btn-sm btn-danger" onClick={clearFile}>Clear File</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
