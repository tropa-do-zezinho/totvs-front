const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

/**
 * Abre uma conexão WebSocket para acompanhar o status de um job de
 * processamento e reconecta automaticamente (backoff simples) se cair.
 * Retorna uma função de limpeza que fecha a conexão e cancela o retry.
 */
export function subscribeToJobStatus(jobId, { onStatus, onError } = {}) {
  let socket;
  let retryTimeout;
  let closedByCaller = false;
  let attempt = 0;

  function connect() {
    socket = new WebSocket(`${WS_BASE_URL}/jobs/${jobId}`);

    socket.addEventListener("message", (event) => {
      try {
        onStatus?.(JSON.parse(event.data));
      } catch {
        onError?.(new Error("Mensagem de status em formato inválido"));
      }
    });

    socket.addEventListener("error", () => {
      onError?.(new Error("Erro na conexão de status do job"));
    });

    socket.addEventListener("close", () => {
      if (closedByCaller) return;
      attempt += 1;
      const delay = Math.min(1000 * 2 ** attempt, 15000);
      retryTimeout = setTimeout(connect, delay);
    });
  }

  connect();

  return function unsubscribe() {
    closedByCaller = true;
    clearTimeout(retryTimeout);
    socket?.close();
  };
}
