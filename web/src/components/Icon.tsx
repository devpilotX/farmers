type Name =
  | "leaf"
  | "overview"
  | "farm"
  | "check"
  | "file"
  | "arrow"
  | "plus"
  | "help"
  | "pin"
  | "menu";
const paths: Record<Name, string> = {
  leaf: "M5 18C3 7 11 3 20 4c1 9-4 16-13 16M7 17 16 8",
  overview: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  farm: "M3 20V9l9-6 9 6v11M8 20v-7h8v7M3 20h18",
  check: "m5 12 4 4L19 6",
  file: "M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  plus: "M12 4v16M4 12h16",
  help: "M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  menu: "M4 6h16M4 12h16M4 18h16",
};
export function Icon({ name, size = 20 }: { name: Name; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
