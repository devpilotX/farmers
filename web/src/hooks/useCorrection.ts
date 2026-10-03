import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError } from "../api";
import { correctionInput } from "../correction";
import type { CorrectionInput, Farm } from "../types";
import { useUnsavedCorrection } from "./useUnsavedCorrection";
export function useCorrection(farm: Farm, onSaved: (farm: Farm) => void) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState<CorrectionInput>();
  const [conflict, setConflict] = useState(false);
  const busy = useRef(false);
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  const { markDirty, markClean } = useUnsavedCorrection();
  async function send(input: CorrectionInput) {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const saved = await api.correct(farm.id, input);
      if (aliveRef.current) {
        markClean();
        onSaved(saved);
      }
    } catch (failure) {
      if (!aliveRef.current) return;
      if (
        failure instanceof ApiError &&
        failure.status >= 400 &&
        failure.status < 500
      ) {
        if (failure.status === 409) setConflict(true);
        else setAttempt(undefined);
      }
      setError(
        failure instanceof Error
          ? failure.message
          : "The correction could not be confirmed.",
      );
    } finally {
      busy.current = false;
      if (aliveRef.current) setSaving(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || attempt || conflict) return;
    try {
      const input = correctionInput(
        new FormData(event.currentTarget),
        farm,
        crypto.randomUUID(),
      );
      markDirty();
      setAttempt(input);
      void send(input);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Check the correction fields.",
      );
    }
  }
  return {
    error,
    saving,
    attempt,
    conflict,
    markDirty,
    markClean,
    submit,
    retry: () => attempt && void send(attempt),
  };
}
