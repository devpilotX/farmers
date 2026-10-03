import type {
  Farm,
  FarmInput,
  Task,
  Workspace,
  CorrectionInput,
  RecordEvent,
} from "./types";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}
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
    throw new ApiError(
      typeof error.message === "string"
        ? error.message
        : `Request failed (${response.status}).`,
      response.status,
      typeof error.code === "string" ? error.code : "SERVICE_ERROR",
    );
  }
  return response.json() as Promise<T>;
}
export const api = {
  farms: (signal?: AbortSignal) => request<Farm[]>("/farms", { signal }),
  workspace: (signal?: AbortSignal) =>
    request<Workspace>("/workspace", { signal }),
  register: (farm: FarmInput) =>
    request<Farm>("/farms", { method: "POST", body: JSON.stringify(farm) }),
  correct: (farm: string, input: CorrectionInput) =>
    request<Farm>(`/farms/${farm}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  history: (farm: string, signal?: AbortSignal) =>
    request<RecordEvent[]>(`/farms/${farm}/history`, { signal }),
  tasks: (farm: string, signal?: AbortSignal) =>
    request<Task[]>(`/farms/${farm}/tasks`, { signal }),
  complete: (farm: string, task: string, completed: boolean) =>
    request<Task>(`/farms/${farm}/tasks/${task}`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    }),
};
