"use client";
import { useState, useEffect } from "react";
import { Palette } from "lucide-react";

const THEMES = ["indigo", "emerald", "rose", "amber"] as const;
type Theme = (typeof THEMES)[number];

const LABELS: Record<Theme, string> = { indigo: "Indigo", emerald: "Emerald", rose: "Rose", amber: "Amber" };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("indigo");

  useEffect(() => {
    const saved = (localStorage.getItem("ha-theme") ?? "indigo") as Theme;
    if (THEMES.includes(saved)) apply(saved);
  }, []);

  function apply(t: Theme) {
    setTheme(t);
    localStorage.setItem("ha-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  function cycle() {
    apply(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);
  }

  const dotColors: Record<Theme, string> = {
    indigo:  "bg-indigo-500",
    emerald: "bg-emerald-500",
    rose:    "bg-rose-500",
    amber:   "bg-amber-500",
  };

  return (
    <button
      onClick={cycle}
      title={`Theme: ${LABELS[theme]} (click to cycle)`}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-xs w-full transition-colors active:scale-95"
      style={{ color: "oklch(1 0 0 / 0.45)" }}
    >
      <Palette className="size-3.5 shrink-0" />
      <span className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${dotColors[theme]} ring-1 ring-white/20`} />
        {LABELS[theme]}
      </span>
    </button>
  );
}
