import { useState } from "react";
import { Icon } from "./Icon";
import type { Route } from "../types";
const links = [
  { route: "overview", name: "Overview", icon: "overview" },
  { route: "farms", name: "Farm registry", icon: "farm" },
  { route: "prepare", name: "Preparedness", icon: "check" },
  { route: "summary", name: "Farmer summary", icon: "file" },
] as const;
export function Sidebar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="mobile-bar">
        <a className="brand" href="#overview">
          <Icon name="leaf" size={28} />
          TerraFort<span className="brand-dot">.</span>
        </a>
        <button
          className="icon-button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="sidebar"
          onClick={() => setOpen(!open)}
        >
          <Icon name="menu" />
        </button>
      </header>
      <aside className={`sidebar ${open ? "is-open" : ""}`} id="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark">
            <Icon name="leaf" size={28} />
          </span>
          TerraFort<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">
          FIELD WORKSPACE<span>Foundation / assisted pilot</span>
        </div>
        <nav aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.route}
              href={`#${link.route}`}
              aria-current={route === link.route ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon name={link.icon} />
              <span>{link.name}</span>
              {route === link.route && <span className="nav-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <Icon name="leaf" size={28} />
          <h2>Prepared, together.</h2>
          <p>A clearer farm record. A practical plan. One step at a time.</p>
        </div>
        <div className="workspace-person">
          <span className="avatar">TF</span>
          <div>
            <strong>Assisted registration</strong>
            <span>Field-agent workspace</span>
          </div>
        </div>
      </aside>
    </>
  );
}
