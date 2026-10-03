import type { Farm } from "../types";
import { fieldLabels } from "../correction";
import { useRecordHistory } from "../hooks/useRecordHistory";
const eventNames: Record<string, string> = {
  FARM_REGISTERED: "Farm registered",
  TASK_UPDATED: "Checklist action updated",
  FARM_CORRECTED: "Farm details corrected",
};
export function History({ farm }: { farm: Farm }) {
  const { events, error, loading, retry } = useRecordHistory(farm.id);
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RECORD HISTORY</span>
          <h2>A record of the work</h2>
          <p className="muted">
            {farm.farmerName} · {farm.village}
          </p>
        </div>
        <a className="button secondary" href={`#summary?farm=${farm.id}`}>
          Farm summary
        </a>
      </div>
      <p className="capture-note">
        The latest 100 events, newest first. Corrections show the changed fields
        and recorded reason, not previous values. Earlier events contain their
        type and time only. This is not a complete archive or a verified account
        of who made each change.
      </p>
      {loading ? (
        <p role="status">Loading record history...</p>
      ) : (
        <>
          {error && (
            <div className="error-box" role="alert">
              <p>{error}</p>
              <button className="button secondary" onClick={retry}>
                Retry history
              </button>
              {events.length > 0 && (
                <p>Previously loaded events may be out of date.</p>
              )}
            </div>
          )}
          {events.length > 0 ? (
            <ol className="record-events" aria-label="Saved record events">
              {events.map((event) => (
                <li key={event.id}>
                  <div className="pending-record-heading">
                    <h3>{eventNames[event.eventType] ?? "Record event"}</h3>
                    {event.recordVersion != null && (
                      <span className="tag neutral">
                        Version {event.recordVersion}
                      </span>
                    )}
                  </div>
                  <p className="field-hint">
                    <time dateTime={event.recordedAt}>
                      {new Date(event.recordedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </p>
                  {event.changedFields.length > 0 && (
                    <p>
                      <strong>Changed:</strong>{" "}
                      {event.changedFields
                        .map((field) => fieldLabels[field] ?? field)
                        .join(", ")}
                    </p>
                  )}
                  {event.reason && (
                    <p className="history-reason">
                      <strong>Reason:</strong> {event.reason}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            !error && (
              <div className="empty-state">
                <h3>No events available</h3>
                <p>
                  No saved events were returned for this record. This does not
                  establish that it has never changed.
                </p>
              </div>
            )
          )}
        </>
      )}
    </section>
  );
}
