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
      className="relative group flex items-center justify-center w-10 h-10 rounded-xl dark:shadow-indigo-500/10 transition-all duration-500 ease-in-out cursor-pointer">
      {/* Sun Icon */}
      <Sun
        className={`absolute w-5 h-5 text-indigo-500 transition-all duration-500 ease-in-out
          ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          }`}
        strokeWidth={2.5}
      />
      {/* Moon Icon */}
      <Moon
        className={`absolute w-5 h-5 text-indigo-300 transition-all duration-500 ease-in-out
          ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
        strokeWidth={2.5}
      />
    </button>
  );
}
