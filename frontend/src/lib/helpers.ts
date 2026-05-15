export function todayLabel() {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function nextCode(prefix: string, existing: { id: number }[], pad = 4) {
  const n = existing.length + 1;
  return `${prefix}-${String(n).padStart(pad, "0")}`;
}
