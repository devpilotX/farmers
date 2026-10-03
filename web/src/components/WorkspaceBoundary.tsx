import { Component, type ReactNode } from "react";
export class WorkspaceBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="route-message">
        <h1>The workspace could not be opened.</h1>
        <p>
          Check your connection and try again. If you were saving a record,
          check the registry before submitting it again.
        </p>
        <button className="button primary" onClick={() => location.reload()}>
          Retry workspace
        </button>
        <a href="/" className="text-button">
          Return to the homepage
        </a>
      </main>
    );
  }
}
