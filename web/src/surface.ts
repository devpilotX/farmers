export type Surface = "homepage" | "workspace" | "not-found";
const workspaceFragments = new Set([
  "overview",
  "farms",
  "prepare",
  "summary",
  "register",
  "pending",
]);
export function surfaceForLocation(pathname: string, hash: string): Surface {
  if (pathname === "/workspace" || pathname === "/workspace/")
    return "workspace";
  if (pathname !== "/" && pathname !== "/index.html") return "not-found";
  return workspaceFragments.has(hash.replace(/^#/, "").split("?")[0])
    ? "workspace"
    : "homepage";
}
