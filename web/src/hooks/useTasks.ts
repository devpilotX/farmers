import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Task } from "../types";
export function useTasks(farmId: string, revision: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Record<string, string>>({});
  const [writeError, setWriteError] = useState<{
    farmId: string;
    message: string;
  }>();
  const [loadedFarm, setLoadedFarm] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const readRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const writeRef = useRef(new Map<string, object>());
  const activeFarmRef = useRef(farmId);
  useEffect(() => {
    activeFarmRef.current = farmId;
    if (!farmId) return;
    const controller = new AbortController();
    readRef.current = controller;
    const generation = ++generationRef.current;
    api
      .tasks(farmId, controller.signal)
      .then((records) => {
        if (controller.signal.aborted || generation !== generationRef.current)
          return;
        setTasks(records);
        setError("");
        setLoadedFarm(farmId);
      })
      .catch((failure) => {
        if (
          !controller.signal.aborted &&
          generation === generationRef.current
        ) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Actions could not be loaded.",
          );
          setLoadedFarm(farmId);
        }
      });
    return () => controller.abort();
  }, [farmId, revision, reloadKey]);
  async function toggle(task: Task) {
    if (task.farmId !== farmId || writeRef.current.has(farmId)) return;
    const ticket = { farmId, id: task.id };
    writeRef.current.set(farmId, ticket);
    setPending((items) => ({ ...items, [farmId]: task.id }));
    setWriteError(undefined);
    setError("");
    const generation = ++generationRef.current;
    readRef.current?.abort();
    try {
      const saved = await api.complete(farmId, task.id, !task.completed);
      if (generation === generationRef.current)
        setTasks((items) =>
          items.map((item) => (item.id === saved.id ? saved : item)),
        );
      if (activeFarmRef.current === farmId) setReloadKey((value) => value + 1);
    } catch (failure) {
      if (activeFarmRef.current === farmId)
        setWriteError({
          farmId,
          message:
            failure instanceof Error
              ? failure.message
              : "The action was not saved.",
        });
    } finally {
      if (writeRef.current.get(farmId) === ticket) {
        writeRef.current.delete(farmId);
        setPending((items) => {
          const next = { ...items };
          delete next[farmId];
          return next;
        });
      }
    }
  }
  return {
    tasks: loadedFarm === farmId ? tasks : [],
    error:
      writeError?.farmId === farmId
        ? writeError.message
        : loadedFarm === farmId
          ? error
          : "",
    pending: pending[farmId] ?? "",
    loading: !!farmId && loadedFarm !== farmId,
    toggle,
    retry: () => {
      setWriteError(undefined);
      setReloadKey((value) => value + 1);
    },
  };
}
