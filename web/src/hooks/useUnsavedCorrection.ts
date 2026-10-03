import { useEffect, useRef } from "react";
export function useUnsavedCorrection() {
  const dirtyRef = useRef(false);
  useEffect(() => {
    const confirm = () => {
      const allowed =
        !dirtyRef.current ||
        window.confirm(
          "Leave this correction? Unsaved details and any unconfirmed submission will be lost. Check record history before starting again.",
        );
      if (allowed) dirtyRef.current = false;
      return allowed;
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const click = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        event.button === 0 &&
        link &&
        link.target !== "_blank" &&
        link.hash !== "#main" &&
        link.href !== location.href &&
        !confirm()
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const route = (event: Event) => {
      if (!confirm()) event.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    window.addEventListener("terrafort:before-route", route);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
      window.removeEventListener("terrafort:before-route", route);
    };
  }, []);
  return {
    markDirty: () => {
      dirtyRef.current = true;
    },
    markClean: () => {
      dirtyRef.current = false;
    },
  };
}
