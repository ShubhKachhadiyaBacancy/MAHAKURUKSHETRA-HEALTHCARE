"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

type ThemeMode = "light" | "dark";

const SunIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.53 5.47l-1.41-1.41M6.88 6.88 5.47 5.47m12.12 0-1.41 1.41M6.88 17.12l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
  </svg>
);

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    const next: ThemeMode =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    applyMode(next);
    setMode(next);
  }, []);

  function onToggle() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    applyMode(next);
    setMode(next);
  }

  return (
    <button
      aria-label="Toggle theme"
      className={cn("theme-toggle", mode === "dark" && "theme-toggle--dark")}
      type="button"
      onClick={onToggle}
    >
      {mode === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function applyMode(value: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", value === "dark");
  root.dataset.theme = value;
  root.style.colorScheme = value;
  localStorage.setItem("theme", value);
}
