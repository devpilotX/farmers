import { api } from "../api";
import { draftFields } from "./records";
import { enqueue, removeDraft, removeLocalRecord, saveDraft } from "./store";
import type { Farm, FarmInput } from "../types";
export async function changeDeviceDraft(
  action: string,
  fields: FormData,
  draftRevision?: string,
) {
  if (action === "draft") {
    const revision = await saveDraft(draftFields(fields), draftRevision);
    return {
      dirty: false,
      revision,
      notice:
        "Sample draft saved on this device. Permission is not saved with a draft.",
    };
  }
  if (
    !window.confirm(
      "Remove the saved device draft? Entries currently on this page will remain, but are not saved.",
    )
  )
    return;
  await removeDraft(draftRevision);
  return {
    dirty: true,
    revision: undefined,
    notice:
      "Saved device draft removed. The entries on this page are not saved.",
  };
}
export async function submitRegistration(
  payload: FarmInput,
  localCapture: boolean,
  keepPending: boolean,
  onCaptured: () => void,
  draftRevision?: string,
): Promise<Farm | undefined> {
  if (localCapture) {
    await enqueue(payload, draftRevision);
    onCaptured();
  }
  if (keepPending && localCapture) return;
  let farm: Farm;
  try {
    farm = await api.register(payload);
  } catch (failure) {
    throw new Error(
      `${failure instanceof Error ? failure.message : "The service could not confirm this submission."}${localCapture ? " A pending copy is kept on this device. Retry that copy without changing its entries." : " Your entries are still here."}`,
    );
  }
  if (!localCapture) return farm;
  try {
    await removeLocalRecord(payload.requestId);
  } catch {
    throw new Error(
      "The server saved this farm, but its device copy could not be removed. Open pending registrations and retry the same copy; the server will return the existing record.",
    );
  }
  return farm;
}
