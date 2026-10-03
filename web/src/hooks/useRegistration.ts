import { useEffect, useRef, useState } from "react";
import { loadLocalRecords } from "../local/store";
import { restoreDraft } from "../local/restoreDraft";
import {
  changeDeviceDraft,
  submitRegistration,
} from "../local/registrationActions";
import { registrationInput } from "../local/registrationInput";
import type { Farm } from "../types";
export function useRegistration(
  localCapture: boolean,
  onSaved: (farm: Farm) => void,
  onQueued: () => void,
) {
  const formRef = useRef<HTMLFormElement>(null);
  const requestId = useRef(crypto.randomUUID());
  const draftRevision = useRef<string>(undefined);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [queued, setQueued] = useState(false);
  const [loading, setLoading] = useState(localCapture);
  useEffect(() => {
    if (!localCapture) return;
    let active = true;
    loadLocalRecords()
      .then((snapshot) => {
        if (!active) return;
        draftRevision.current = snapshot.draft?.revision;
        if (snapshot.draft) setDirty(true);
        setNotice(restoreDraft(formRef.current, snapshot));
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [localCapture]);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || queued) return;
    const fields = new FormData(event.currentTarget);
    const action = (event.nativeEvent.submitter as HTMLButtonElement | null)
      ?.dataset.action;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (action === "draft" || action === "discard-draft") {
        const result = await changeDeviceDraft(
          action,
          fields,
          draftRevision.current,
        );
        if (result) {
          draftRevision.current = result.revision;
          setDirty(result.dirty);
          setNotice(result.notice);
        }
        return;
      }
      const farm = await submitRegistration(
        registrationInput(fields, requestId.current),
        localCapture,
        action === "queue",
        () => {
          draftRevision.current = undefined;
          setQueued(true);
          setDirty(false);
        },
        draftRevision.current,
      );
      if (!farm) {
        onQueued();
        return;
      }
      setDirty(false);
      onSaved(farm);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not save these entries. Keep this page open and try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return {
    formRef,
    error,
    notice,
    saving,
    dirty,
    queued,
    loading,
    setDirty,
    submit,
  };
}
