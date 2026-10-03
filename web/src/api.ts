import type { Farm, FarmInput, Task, Workspace } from "./types";
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    signal: init.signal
      ? AbortSignal.any([init.signal, AbortSignal.timeout(10000)])
      : AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "The service is unavailable. Please retry." }));
    throw new Error(error.message ?? `Request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}
export const api = {
  farms: (signal?: AbortSignal) => request<Farm[]>("/farms", { signal }),
  workspace: (signal?: AbortSignal) =>
    request<Workspace>("/workspace", { signal }),
  register: (farm: FarmInput) =>
    request<Farm>("/farms", { method: "POST", body: JSON.stringify(farm) }),
  tasks: (farm: string, signal?: AbortSignal) =>
    request<Task[]>(`/farms/${farm}/tasks`, { signal }),
  complete: (farm: string, task: string, completed: boolean) =>
    request<Task>(`/farms/${farm}/tasks/${task}`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    }),
};
