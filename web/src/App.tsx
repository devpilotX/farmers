import { lazy, Suspense, useEffect, useState } from "react";
import { Homepage } from "./home/Homepage";
import { acceptNavigation } from "./navigation";
import { surfaceForLocation } from "./surface";
import { WorkspaceBoundary } from "./components/WorkspaceBoundary";
const FieldWorkspace = lazy(() => import("./FieldWorkspace"));
export default function App() {
  const [surface, setSurface] = useState(() =>
    surfaceForLocation(location.pathname, location.hash),
  );
  useEffect(() => {
    let acceptedUrl = location.href;
    const change = (event: HashChangeEvent | PopStateEvent) => {
      if (
        !acceptNavigation(
          event instanceof HashChangeEvent ? event.oldURL : acceptedUrl,
        )
      ) {
        event.stopImmediatePropagation();
        return;
      }
      acceptedUrl = location.href;
      setSurface(surfaceForLocation(location.pathname, location.hash));
    };
    window.addEventListener("hashchange", change);
    window.addEventListener("popstate", change);
    return () => {
      window.removeEventListener("hashchange", change);
      window.removeEventListener("popstate", change);
    };
  }, []);
  if (surface === "homepage") return <Homepage />;
  if (surface === "not-found")
    return (
      <main className="route-message">
        <h1>That page is not here.</h1>
        <p>Find the product story and the field workspace on the homepage.</p>
        <a href="/" className="button primary">
          Return to TerraFort
        </a>
      </main>
    );
  return (
    <WorkspaceBoundary>
      <Suspense
        fallback={
          <main className="route-message" role="status">
            Opening the field workspace...
          </main>
        }
      >
        <FieldWorkspace />
      </Suspense>
    </WorkspaceBoundary>
  );
}
