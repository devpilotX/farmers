import { useRef } from "react";
import { Icon } from "../components/Icon";
const sections = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-farmers", label: "Who it is for" },
  { href: "#our-approach", label: "Our approach" },
];
export function PublicHeader() {
  const menu = useRef<HTMLDetailsElement>(null);
  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <a className="brand" href="/" aria-label="TerraFort homepage">
          <Icon name="leaf" size={28} />
          TerraFort<span className="brand-dot">.</span>
        </a>
        <nav className="desktop-public-nav" aria-label="Product navigation">
          {sections.map((section) => (
            <a key={section.href} href={section.href}>
              {section.label}
            </a>
          ))}
        </nav>
        <a href="/workspace#overview" className="public-workspace-link">
          Field workspace
          <Icon name="arrow" size={18} />
        </a>
        <details
          ref={menu}
          className="public-menu"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeMenu();
              menu.current?.querySelector("summary")?.focus();
            }
          }}
        >
          <summary aria-label="Open product menu">
            <Icon name="menu" />
            <span>Menu</span>
          </summary>
          <nav aria-label="Mobile product navigation">
            {sections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => {
                  closeMenu();
                  requestAnimationFrame(() =>
                    document.getElementById(section.href.slice(1))?.focus(),
                  );
                }}
              >
                {section.label}
              </a>
            ))}
            <a href="/workspace#overview">
              Explore the field workspace
              <Icon name="arrow" size={18} />
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
