import { useEffect, useState } from "react";
import { api } from "../api";
import type { RecordEvent } from "../types";
export function useRecordHistory(farm: string) {
  const [events, setEvents] = useState<RecordEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api
      .history(farm, controller.signal)
      .then((events) => {
        setEvents(events);
        setError("");
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : "History is unavailable.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [farm, revision]);
  return {
    events,
    error,
    loading,
    retry: () => {
      setLoading(true);
      setRevision((value) => value + 1);
    },
  };
}
