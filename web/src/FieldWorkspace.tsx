import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Icon } from "./components/Icon";
import { FarmSelection } from "./components/FarmSelection";
import { useWorkspace } from "./hooks/useWorkspace";
import { useTasks } from "./hooks/useTasks";
import {
  currentRoute,
  selectedFarm,
  navigate,
  acceptNavigation,
} from "./navigation";
import { Overview } from "./pages/Overview";
import { Registry } from "./pages/Registry";
import { Registration } from "./pages/Registration";
import { Preparedness } from "./pages/Preparedness";
import { PendingRecords } from "./pages/PendingRecords";
import { localCaptureAllowed } from "./local/records";
import { Correction } from "./pages/Correction";
import { History } from "./pages/History";
import { Summary } from "./pages/Summary";
const titles = {
  overview: "Farm preparedness",
  farms: "Farm registry",
  register: "New farm record",
  prepare: "Preparedness plan",
  summary: "Farmer summary",
  pending: "Pending registrations",
  edit: "Correct farm details",
  history: "Farm record history",
};
export default function FieldWorkspace() {
  const [route, setRoute] = useState(currentRoute);
  const [selected, setSelected] = useState(selectedFarm);
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [noticeFarm, setNoticeFarm] = useState("");
  const { farms, workspace, error, loading, reload, refresh, replace } =
    useWorkspace();
  const farm =
    farms.find((farm) => farm.id === selected) ??
    (!selected ? farms[0] : undefined);
  const taskState = useTasks(farm?.id ?? "", revision);
  useEffect(() => {
    const change = (event: HashChangeEvent) => {
      if (!acceptNavigation(event.oldURL)) {
        event.stopImmediatePropagation();
        return;
      }
      setRoute(currentRoute());
      setSelected(selectedFarm());
      requestAnimationFrame(() =>
        document.getElementById("page-title")?.focus(),
      );
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = `${titles[route]} | TerraFort`;
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", "noindex,nofollow");
  }, [route]);
  const localCapture = localCaptureAllowed(workspace?.mode, location.hostname);
  const captureView =
    localCapture && (route === "register" || route === "pending");
  const isRecordView = route === "edit" || route === "history";
  const isFarmView = route === "prepare" || route === "summary";
  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <Sidebar route={route} />
      <div className="app-body">
        <header className="topbar">
          <span>
            <a href="/" aria-label="TerraFort homepage">
              TerraFort
            </a>{" "}
            <span className="breadcrumb-separator">/</span> {titles[route]}
          </span>
          <span className="workspace-status">
            <span />
            {workspace?.mode === "local-demo"
              ? "Local demo workspace"
              : workspace
                ? "Authenticated workspace"
                : "Connecting to workspace"}
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <span className="eyebrow">FARM RECORDS & PREPAREDNESS</span>
              <h1 id="page-title" tabIndex={-1}>
                {titles[route]}
              </h1>
              <p>Know the farm. Make a plan. Keep the record.</p>
            </div>
            {route !== "register" && (
              <a className="button secondary" href="#register">
                <Icon name="plus" />
                Register a farm
              </a>
            )}
          </div>
          <div className="demo-banner">
            <span className="tag">FOUNDATION</span>
            <p>
              {workspace?.mode === "authenticated"
                ? "Checklist content is illustrative, not an official alert or approved agronomy advice."
                : "Local evaluation only. Use sample records, never real farmer data. No live weather or insurance service is connected."}
            </p>
          </div>
          {notice &&
            noticeFarm === farm?.id &&
            (route === "summary" || route === "history") && (
              <p className="success-notice" role="status">
                {notice}
              </p>
            )}
          {loading ? (
            <div className="empty-state" role="status">
              Loading the farm workspace...
            </div>
          ) : error && !captureView ? (
            <div className="error-box" role="alert">
              <h2>We could not load the workspace.</h2>
              <p>{error}</p>
              <button className="button secondary" onClick={reload}>
                Try again
              </button>
              {farms.length > 0 && (
                <p>
                  Previously loaded records remain available once the connection
                  returns.
                </p>
              )}
            </div>
          ) : (
            <>
              {error && captureView && (
                <p className="error-box" role="alert">
                  The API is unavailable. Device copies are not confirmed farm
                  records. {error}
                </p>
              )}
              {route === "pending" && (
                <PendingRecords localCapture={localCapture} onSynced={reload} />
              )}
              {route === "overview" && <Overview farms={farms} />}
              {route === "farms" && <Registry farms={farms} />}
              {route === "register" && (
                <Registration
                  localCapture={localCapture}
                  onQueued={() => {
                    setNotice("");
                    navigate("pending");
                  }}
                  onSaved={(farm) => {
                    reload();
                    setRevision((value) => value + 1);
                    setNoticeFarm(farm.id);
                    setNotice(
                      "Farm record saved. Its preparedness checklist is ready.",
                    );
                    navigate("summary", farm.id);
                  }}
                />
              )}
              {isRecordView &&
                (farm ? (
                  route === "edit" ? (
                    <Correction
                      key={farm.id + ":" + farm.version}
                      farm={farm}
                      onRefresh={refresh}
                      onSaved={(saved) => {
                        replace(saved);
                        setRevision((value) => value + 1);
                        setNoticeFarm(saved.id);
                        setNotice(
                          "Reviewed correction saved. Original permission and actions are unchanged.",
                        );
                        navigate("summary", saved.id);
                      }}
                    />
                  ) : (
                    <History key={farm.id} farm={farm} />
                  )
                ) : (
                  <section className="empty-state">
                    <h2>Farm not found in this workspace</h2>
                    <p>
                      Open a saved farm from the registry before reviewing its
                      details.
                    </p>
                    <a className="button secondary" href="#farms">
                      Open farm registry
                    </a>
                  </section>
                ))}
              {isFarmView &&
                (farm ? (
                  <>
                    <FarmSelection farms={farms} selected={farm.id} />
                    {taskState.error && (
                      <div className="error-box" role="alert">
                        <p>{taskState.error}</p>
                        <button
                          className="button secondary"
                          onClick={taskState.retry}
                        >
                          Retry actions
                        </button>
                      </div>
                    )}
                    {taskState.loading ? (
                      <p role="status">Loading the saved actions...</p>
                    ) : route === "prepare" &&
                      taskState.error &&
                      !taskState.tasks.length ? null : route === "prepare" ? (
                      <Preparedness
                        farm={farm}
                        tasks={taskState.tasks}
                        pending={taskState.pending}
                        onToggle={taskState.toggle}
                      />
                    ) : (
                      <Summary
                        farm={farm}
                        tasks={
                          taskState.error && !taskState.tasks.length
                            ? undefined
                            : taskState.tasks
                        }
                      />
                    )}
                  </>
                ) : (
                  <section className="empty-state">
                    <h2>
                      {selected
                        ? "Farm not found in this workspace"
                        : "Register a farm first"}
                    </h2>
                    <p>
                      A summary and plan are created from a saved farm record.
                    </p>
                    <a className="button primary" href="#register">
                      Register a farm
                    </a>
                  </section>
                ))}
            </>
          )}
          <footer className="footer">
            <span>
              TerraFort <span className="footer-dot">·</span> Protect before.
              Prove after. Recover faster.
            </span>
            <span>Foundation v0.1</span>
          </footer>
        </main>
      </div>
    </>
  );
}
