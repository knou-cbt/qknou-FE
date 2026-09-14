import { getAuthToken } from "./auth-token";

export class ApiError extends Error {
  constructor(public status: number, public payload?: unknown) {
    super(`API ${status}`);
  }
}

let unauthorizedHandler: () => void = () => {};

/** AuthProvider 마운트 시 등록: 401 응답 수신 시 호출된다 */
export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn;
}

function handleUnauthorized() {
  unauthorizedHandler();
}

interface AuthorizedFetchOptions extends RequestInit {
  /** true(기본): 토큰 없으면 요청 자체를 막고 ApiError(401) throw */
  requireAuth?: boolean;
}

export async function authorizedFetch<T>(
  url: string,
  { requireAuth = true, headers, ...init }: AuthorizedFetchOptions = {}
): Promise<T> {
  const token = getAuthToken();
  if (requireAuth && !token) throw new ApiError(401);

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401);
  }
  if (!res.ok) {
    throw new ApiError(res.status, await res.json().catch(() => undefined));
  }

  const text = await res.text();
  if (!text) return undefined as T;
  const json = JSON.parse(text) as { success: boolean; data: T };
  return json.data;
}
