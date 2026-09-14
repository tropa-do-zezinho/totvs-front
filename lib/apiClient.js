export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = "GET", body, headers, ...rest } = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      result?.message ?? result?.details?.[0] ?? `Falha na requisição (status ${response.status})`,
      response.status,
      result
    );
  }
  return result;
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
};
