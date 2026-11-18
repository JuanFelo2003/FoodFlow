import type { LoginResponse, AuthTokens } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

let refreshPromise: Promise<string | null> | null = null;

function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("No está configurada la variable VITE_API_URL");
  }

  return `${API_URL}${path}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? data.detail
        : null;

    throw new Error(
      typeof detail === "string"
        ? detail
        : `Error en la solicitud (${response.status})`,
    );
  }

  return data as T;
}

function expireSession(): void {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("employee");

  window.dispatchEvent(new Event("foodflow:session-expired"));
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const params = new URLSearchParams({ email, password });

  const response = await fetch(getApiUrl(`/auth/login?${params.toString()}`), {
    method: "POST",
  });

  return handleResponse<LoginResponse>(response);
}

export async function refreshSession(
  refreshToken: string,
): Promise<AuthTokens> {
  const params = new URLSearchParams({
    refresh_token: refreshToken,
  });

  const response = await fetch(
    getApiUrl(`/auth/refresh?${params.toString()}`),
    { method: "POST" },
  );

  return handleResponse<AuthTokens>(response);
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    const refreshToken = sessionStorage.getItem("refresh_token");

    if (!refreshToken) {
      expireSession();
      return null;
    }

    refreshPromise = refreshSession(refreshToken)
      .then((tokens) => {
        sessionStorage.setItem("access_token", tokens.access_token);
        sessionStorage.setItem("refresh_token", tokens.refresh_token);

        return tokens.access_token;
      })
      .catch(() => {
        expireSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  const accessToken = sessionStorage.getItem("access_token");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(getApiUrl(path), {
    ...options,
    headers,
  });

  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await refreshAccessToken();

  if (!newAccessToken) {
    return response;
  }

  const retryHeaders = new Headers(options.headers);
  retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

  response = await fetch(getApiUrl(path), {
    ...options,
    headers: retryHeaders,
  });

  if (response.status === 401) {
    expireSession();
  }

  return response;
}
