import type { Route } from "./types";
const routes: Route[] = ["overview", "farms", "prepare", "summary", "register"];
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
