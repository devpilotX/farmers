import { useEffect, useState } from "react";
import { api } from "../api";
import type { Task } from "../types";
export function useTasks(farmId: string, revision: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const [loadedFarm, setLoadedFarm] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (!farmId) return;
    const controller = new AbortController();
    api
      .tasks(farmId, controller.signal)
      .then((records) => {
        setTasks(records);
        setError("");
        setLoadedFarm(farmId);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(error.message);
          setLoadedFarm(farmId);
        }
      });
    return () => controller.abort();
  }, [farmId, revision, reloadKey]);
  async function toggle(task: Task) {
    setPending(task.id);
    setError("");
    try {
      const saved = await api.complete(farmId, task.id, !task.completed);
      setTasks((items) =>
        items.map((item) => (item.id === saved.id ? saved : item)),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "The action was not saved.",
      );
    } finally {
      setPending("");
    }
  }
  return {
    tasks: loadedFarm === farmId ? tasks : [],
    error: loadedFarm === farmId ? error : "",
    pending,
    loading: !!farmId && loadedFarm !== farmId,
    toggle,
    retry: () => setReloadKey((value) => value + 1),
  };
}
