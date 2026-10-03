import type { Route } from "./types";
const routes: Route[] = [
  "overview",
  "farms",
  "prepare",
  "summary",
  "register",
  "pending",
  "edit",
  "history",
];
export function currentRoute(): Route {
  const route = location.hash.slice(1).split("?")[0] as Route;
  return routes.includes(route) ? route : "overview";
}
export function selectedFarm(): string {
  return new URLSearchParams(location.hash.split("?")[1]).get("farm") ?? "";
}
export function navigate(route: Route, farm?: string) {
  location.hash = route + (farm ? `?farm=${encodeURIComponent(farm)}` : "");
}

export function acceptNavigation(previousUrl: string): boolean {
  const guard = new Event("terrafort:before-route", { cancelable: true });
  if (window.dispatchEvent(guard)) return true;
  history.replaceState(null, "", previousUrl);
  return false;
}
