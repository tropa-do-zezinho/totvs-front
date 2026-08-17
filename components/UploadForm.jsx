"use client";

import { useCallback, useRef, useState } from "react";
import { apiClient, ApiError } from "@/lib/apiClient";

export default function UploadForm({ onJobCreated }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = useCallback((fileList) => {
    const [selected] = fileList;
    if (selected) setFile(selected);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { jobId } = await apiClient.post("/reports", formData);
      onJobCreated?.(jobId);
      setFile(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar o arquivo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => event.key === "Enter" && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={[
          "flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging ? "border-cyan bg-surface-raised" : "border-line bg-surface",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
        {file ? (
          <p className="font-mono text-sm text-foreground">{file.name}</p>
        ) : (
          <>
            <p className="font-display text-lg font-medium text-foreground">
              Solte um arquivo aqui ou clique para escolher
            </p>
            <p className="font-mono text-xs text-foreground-dim">CSV, XLSX ou JSON</p>
          </>
        )}
      </div>

      {error && <p className="border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>}

      <button
        type="submit"
        disabled={!file || isSubmitting}
        className="self-start rounded-lg bg-cyan px-6 py-2.5 font-display text-sm font-medium text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "Enviando…" : "Enviar para processamento"}
      </button>
    </form>
  );
}
