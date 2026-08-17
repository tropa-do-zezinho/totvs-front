"use client";

import { useState } from "react";
import { apiClient, ApiError } from "@/lib/apiClient";

export default function ShareModal({ reportId, sharedWith = [], onClose, onShared }) {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!identifier.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const share = await apiClient.post(`/reports/${reportId}/shares`, { identifier });
      onShared?.(share);
      setIdentifier("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível compartilhar o relatório.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="rounded-2xl w-full max-w-md border border-line bg-surface p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="share-modal-title" className="font-display text-lg font-medium">
            Compartilhar relatório
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="font-mono text-foreground-dim hover:text-foreground"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-foreground-dim">
              E-mail ou usuário
            </span>
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="pessoa@empresa.com"
              className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-foreground outline-none focus:border-cyan"
            />
          </label>

          {error && <p className="border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start rounded-lg bg-cyan px-5 py-2 font-display text-sm font-medium text-ink disabled:opacity-40"
          >
            {isSubmitting ? "Compartilhando…" : "Compartilhar"}
          </button>
        </form>

        {sharedWith.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-foreground-dim">
              Já compartilhado com
            </p>
            <ul className="flex flex-col gap-1">
              {sharedWith.map((person) => (
                <li key={person.id ?? person.identifier} className="font-mono text-sm text-foreground">
                  {person.identifier}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
