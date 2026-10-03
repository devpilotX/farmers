import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { Farm, Workspace } from "../types";
export function useWorkspace() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.farms(controller.signal),
      api.workspace(controller.signal),
    ])
      .then(([records, metadata]) => {
        setFarms(records);
        setWorkspace(metadata);
        setError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "Could not load the workspace.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  return { farms, workspace, error, loading, reload };
}
