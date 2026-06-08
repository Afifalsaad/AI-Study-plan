"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="relative group flex items-center justify-center w-10 h-10 rounded-xl 
        bg-gradient-to-br from-indigo-100 to-purple-100 
        dark:from-indigo-900/50 dark:to-purple-900/50
        hover:from-indigo-200 hover:to-purple-200 
        dark:hover:from-indigo-800/60 dark:hover:to-purple-800/60
        border border-indigo-200/60 dark:border-indigo-500/30
        shadow-sm hover:shadow-md dark:shadow-indigo-500/10
        transition-all duration-300 ease-in-out
        cursor-pointer"
    >
      {/* Sun Icon */}
      <Sun
        className={`absolute w-5 h-5 text-amber-500 transition-all duration-500 ease-in-out
          ${theme === "light" 
            ? "opacity-100 rotate-0 scale-100" 
            : "opacity-0 rotate-90 scale-0"
          }`}
        strokeWidth={2.5}
      />
      {/* Moon Icon */}
      <Moon
        className={`absolute w-5 h-5 text-indigo-300 transition-all duration-500 ease-in-out
          ${theme === "dark" 
            ? "opacity-100 rotate-0 scale-100" 
            : "opacity-0 -rotate-90 scale-0"
          }`}
        strokeWidth={2.5}
      />

      {/* Glow ring on hover */}
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ring-2 ring-indigo-400/30 dark:ring-indigo-400/20" />
    </button>
  );
}
