import {
  isExpired,
  queueLimit,
  type DraftFields,
  type LocalSnapshot,
  type PendingRegistration,
} from "./records";
import type { FarmInput } from "../types";
type Entry = {
  id: string;
  savedAt: number;
  fields?: DraftFields;
  revision?: string;
  payload?: FarmInput;
};
const databaseName = "terrafort-sample-capture-v1";
const unavailable = () =>
  new Error(
    "Device storage is unavailable. Keep this page open and enable browser storage before saving a sample draft or submission.",
  );
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(unavailable());
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("records", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(unavailable());
    request.onblocked = () => reject(unavailable());
  });
}
async function transaction<T>(
  work: (
    store: IDBObjectStore,
    finish: (value: T) => void,
    fail: (error: Error) => void,
  ) => void,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("records", "readwrite");
    let result: T;
    let error: Error | undefined;
    tx.oncomplete = () => {
      database.close();
      resolve(result);
    };
    tx.onabort = tx.onerror = () => {
      database.close();
      reject(error ?? unavailable());
    };
    work(
      tx.objectStore("records"),
      (value) => {
        result = value;
      },
      (failure) => {
        error = failure;
        tx.abort();
      },
    );
  });
}
function snapshotFromEntries(entries: Entry[], now: number): LocalSnapshot {
  const live = entries.filter((entry) => !isExpired(entry.savedAt, now));
  const draft = live.find((entry) => entry.id === "draft" && entry.fields);
  return {
    draft: draft?.fields
      ? {
          savedAt: draft.savedAt,
          fields: draft.fields,
          revision: draft.revision ?? "",
        }
      : undefined,
    expired: entries.length - live.length,
    pending: live
      .filter((entry): entry is Entry & { payload: FarmInput } =>
        Boolean(entry.payload),
      )
      .map((entry) => ({
        id: entry.id,
        savedAt: entry.savedAt,
        payload: entry.payload,
      }))
      .sort((a, b) => a.savedAt - b.savedAt),
  };
}
export async function loadLocalRecords(
  now = Date.now(),
): Promise<LocalSnapshot> {
  return transaction((store, finish) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const entries = request.result as Entry[];
      entries
        .filter((entry) => isExpired(entry.savedAt, now))
        .forEach((entry) => store.delete(entry.id));
      const snapshot = snapshotFromEntries(entries, now);
      finish(snapshot);
    };
  });
}
const draftChanged = () =>
  new Error(
    "The saved draft changed in another tab. Reload registration to review the current copy before changing it.",
  );
export async function saveDraft(
  fields: DraftFields,
  expectedRevision?: string,
): Promise<string> {
  return transaction((store, finish, fail) => {
    const request = store.get("draft");
    request.onsuccess = () => {
      const existing = request.result as Entry | undefined;
      if (existing && existing.revision !== expectedRevision)
        return fail(draftChanged());
      const revision = crypto.randomUUID();
      store.put({ id: "draft", fields, revision, savedAt: Date.now() });
      finish(revision);
    };
  });
}
export async function removeDraft(expectedRevision?: string): Promise<void> {
  return transaction((store, finish, fail) => {
    const request = store.get("draft");
    request.onsuccess = () => {
      const existing = request.result as Entry | undefined;
      if (existing && existing.revision !== expectedRevision)
        return fail(draftChanged());
      store.delete("draft");
      finish(undefined);
    };
  });
}
export async function enqueue(
  payload: FarmInput,
  draftRevision?: string,
): Promise<void> {
  return transaction((store, finish, fail) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const entries = request.result as Entry[];
      const existing = entries.find((entry) => entry.id === payload.requestId);
      if (existing) {
        if (JSON.stringify(existing.payload) !== JSON.stringify(payload))
          return fail(
            new Error(
              "This pending request already contains different entries. Do not change a submission that may have reached the server.",
            ),
          );
        return finish(undefined);
      }
      const now = Date.now();
      entries
        .filter((entry) => isExpired(entry.savedAt, now))
        .forEach((entry) => store.delete(entry.id));
      if (
        entries.filter(
          (entry) => entry.payload && !isExpired(entry.savedAt, now),
        ).length >= queueLimit
      )
        return fail(
          new Error(
            "There are 20 pending registrations. Send or discard one before adding another.",
          ),
        );
      store.put({ id: payload.requestId, payload, savedAt: now });
      const draft = entries.find((entry) => entry.id === "draft");
      if (draftRevision && draft?.revision === draftRevision)
        store.delete("draft");
      finish(undefined);
    };
  });
}

export async function removeLocalRecord(id: string): Promise<void> {
  return transaction((store, finish) => {
    store.delete(id);
    finish(undefined);
  });
}
export type { PendingRegistration };
