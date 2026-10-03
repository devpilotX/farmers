import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import { loadLocalRecords, removeLocalRecord } from "../local/store";
import type { PendingRegistration } from "../local/records";
export function PendingRecords({
  localCapture,
  onSynced,
}: {
  localCapture: boolean;
  onSynced: () => void;
}) {
  const [records, setRecords] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const reload = useCallback(async () => {
    try {
      const snapshot = await loadLocalRecords();
      setRecords(snapshot.pending);
      if (snapshot.expired)
        setNotice(
          "Expired copies were removed. Check the registry before recreating a previously submitted farm.",
        );
      setError("");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not read device storage.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (localCapture) {
      void Promise.resolve().then(reload);
      window.addEventListener("focus", reload);
    }
    return () => window.removeEventListener("focus", reload);
  }, [localCapture, reload]);
  async function send(record: PendingRegistration) {
    if (locked.current) return;
    locked.current = true;
    setBusy(record.id);
    setError("");
    setNotice("");
    try {
      const current = (await loadLocalRecords()).pending.find(
        (item) => item.id === record.id,
      );
      if (!current)
        throw new Error(
          "This copy expired or was removed in another tab. Refresh the pending list and check the registry.",
        );
      await api.register(current.payload);
      await removeLocalRecord(current.id);
      await reload();
      onSynced();
      setNotice(
        "The server confirmed this farm record. Its device copy was removed.",
      );
      heading.current?.focus();
    } catch (failure) {
      setError(
        `${failure instanceof Error ? failure.message : "The server could not confirm this request."} Check the registry before creating a new submission; repeat this fixed request when you retry.`,
      );
    } finally {
      locked.current = false;
      setBusy("");
    }
  }
  async function discard(record: PendingRegistration) {
    if (
      locked.current ||
      !window.confirm(
        "Discard this device copy? This cannot cancel a request already sent or delete a farm on the server. Check the registry if a request was attempted.",
      )
    )
      return;
    locked.current = true;
    setBusy(record.id);
    setError("");
    try {
      await removeLocalRecord(record.id);
      await reload();
      setNotice("Device copy discarded. Server records were not changed.");
      heading.current?.focus();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not discard the device copy.",
      );
    } finally {
      locked.current = false;
      setBusy("");
    }
  }
  if (!localCapture)
    return (
      <section className="empty-state">
        <h2>Device capture is not enabled here</h2>
        <p>
          Sample storage is restricted to a verified local evaluation workspace.
          Authenticated farmer records are not saved in this browser.
        </p>
      </section>
    );
  return (
    <section className="panel pending-records">
      <div className="section-heading">
        <div>
          <span className="eyebrow">DEVICE COPIES, NOT CONFIRMED FARMS</span>
          <h2 ref={heading} tabIndex={-1}>
            Review before sending
          </h2>
          <p className="muted">
            Only send a reviewed sample when the API is available. Nothing is
            sent automatically.
          </p>
        </div>
        <span className="tag neutral">{records.length} pending</span>
      </div>
      <div className="capture-note">
        <strong>Kept only in this browser</strong>
        <p>
          Copies expire after seven days and can be cleared by the browser. They
          are not encrypted or backed up. A fixed request identifier prevents
          duplicate registration when a server response is lost.
        </p>
      </div>
      {notice && (
        <p className="success-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <div className="error-box" role="alert">
          <p>{error}</p>
          <button
            className="button secondary"
            disabled={Boolean(busy)}
            onClick={reload}
          >
            Refresh pending list
          </button>
        </div>
      )}
      {loading ? (
        <p role="status">Reading device copies...</p>
      ) : !records.length && !error ? (
        <div className="empty-state">
          <h3>No pending registrations</h3>
          <p>
            Confirmed farm records are in the registry. Save a sample for later
            from the registration form.
          </p>
          <a href="#register" className="button secondary">
            Register a farm
          </a>
        </div>
      ) : (
        records.map((record) => (
          <article
            className="pending-record"
            key={record.id}
            aria-labelledby={`pending-${record.id}`}
          >
            <div className="pending-record-heading">
              <div>
                <h3 id={`pending-${record.id}`}>{record.payload.farmerName}</h3>
                <p>
                  {record.payload.village} · {record.payload.district}
                </p>
              </div>
              <span className="tag neutral">Not confirmed</span>
            </div>
            <dl className="pending-facts">
              <div>
                <dt>Crop</dt>
                <dd>
                  {record.payload.crop} · {record.payload.stage}
                </dd>
              </div>
              <div>
                <dt>Reported area</dt>
                <dd>{record.payload.areaHectares} ha</dd>
              </div>
              <div>
                <dt>Saved on device</dt>
                <dd>{new Date(record.savedAt).toLocaleString()}</dd>
              </div>
            </dl>
            <details>
              <summary>Review the fixed submission</summary>
              <dl className="pending-facts">
                <div>
                  <dt>Recorded assets</dt>
                  <dd>{record.payload.assets || "None recorded"}</dd>
                </div>
                <div>
                  <dt>Permission version</dt>
                  <dd>{record.payload.consentVersion}</dd>
                </div>
                <div>
                  <dt>Request reference</dt>
                  <dd>{record.id}</dd>
                </div>
              </dl>
              <p>Longitude, latitude boundary</p>
              <pre className="pending-boundary">
                {record.payload.boundary
                  .map((point) => `${point.longitude}, ${point.latitude}`)
                  .join("\n")}
              </pre>
            </details>
            <div className="capture-actions">
              <button
                className="button primary"
                disabled={Boolean(busy)}
                onClick={() => send(record)}
              >
                {busy === record.id ? "Working..." : "Send this registration"}
              </button>
              <button
                className="button secondary"
                disabled={Boolean(busy)}
                onClick={() => discard(record)}
              >
                Discard local copy
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
