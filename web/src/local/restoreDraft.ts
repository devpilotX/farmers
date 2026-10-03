import type { LocalSnapshot } from "./records";
export function restoreDraft(
  form: HTMLFormElement | null,
  snapshot: LocalSnapshot,
): string {
  if (snapshot.draft) {
    for (const [name, value] of Object.entries(snapshot.draft.fields)) {
      const control = form?.elements.namedItem(name);
      if (
        control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement ||
        control instanceof HTMLTextAreaElement
      )
        control.value = value;
    }
    return "Sample draft restored. Review every field and give permission again before submission.";
  }
  if (snapshot.pending.length)
    return "There are pending submissions on this device. Open pending registrations and retry those copies before re-entering a previously submitted farm.";
  if (snapshot.expired)
    return "Expired device copies were removed. Check the registry before entering a previously submitted farm again.";
  return "";
}
