import { auth } from "./auth/auth"; // Cesta k tvojmu súboru, kde exportuješ const auth

const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(url: string, method: string, body?: unknown): Promise<T> {
  const isFormData = body instanceof FormData;

  const oidcUser = await auth.getUser();
  const token = oidcUser?.access_token;

  const headers: HeadersInit = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(`${BASE_URL}/${url}`, {
    method,
    credentials: "include",
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? "Request failed.", res.status);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => apiFetch<T>(url, "GET"),
  post: <T>(url: string, body?: unknown) => apiFetch<T>(url, "POST", body),
  put: <T>(url: string, body?: unknown) => apiFetch<T>(url, "PUT", body),
  patch: <T>(url: string, body?: unknown) => apiFetch<T>(url, "PATCH", body),
  delete: <T>(url: string) => apiFetch<T>(url, "DELETE"),
};