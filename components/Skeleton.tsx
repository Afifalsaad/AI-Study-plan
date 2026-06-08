import React from "react";

const Skeleton = () => {
  return (
    <div className="flex items-center justify-center animate-pulse">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Sidebar Toggle Button Placeholder (Mobile) */}
        <div className="md:hidden w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />

        {/* File Icon Placeholder */}
        <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg shrink-0 hidden xs:block">
          <div className="w-5 h-5 bg-emerald-200 dark:bg-emerald-800/50 rounded" />
        </div>

        {/* --- exact match starts here --- */}
        <div className="min-w-0 flex-1">
          {/* Row 1: Title and Badge */}
          <div className="flex items-center gap-2">
            {/* Title Skeleton (matches h1 size) */}
            <div className="h-4 sm:h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-32 sm:w-48" />

            {/* Badge Skeleton (matches Analyzed badge) */}
            <div className="h-4 bg-emerald-100/60 dark:bg-emerald-900/40 rounded-full w-12 shrink-0" />
          </div>

          {/* Row 2: Source Info (matches p tag size) */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {/* "Source:" text placeholder */}
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-10" />

            {/* Filename placeholder */}
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24" />

            {/* Dot separator */}
            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />

            {/* File size placeholder */}
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-8" />
          </div>
        </div>
        {/* --- exact match ends here --- */}
      </div>

      {/* Action Buttons Placeholder */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Export Button */}
        <div className="hidden md:block w-32 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        {/* Icon Button 1 */}
        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        {/* Icon Button 2 */}
        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
};

export default Skeleton;
