import React from "react";

const Skeleton = () => {
  return (
    <div className="min-w-0 animate-pulse">
      {/* Title and Badge Skeleton */}
      <div className="flex items-center gap-2 mb-1.5">
        {/* Title Skeleton (Matching text-sm/text-base) */}
        <div className="h-4 sm:h-5 w-36 sm:w-48 bg-slate-200 dark:bg-slate-800 rounded" />

        {/* Badge Skeleton (Matching the 'Analyzed' badge) */}
        <div className="h-4 w-12 bg-emerald-200/60 dark:bg-emerald-950/40 rounded-full shrink-0" />
      </div>

      {/* Subtitle/Source Info Skeleton */}
      <div className="flex items-center gap-1.5">
        {/* "Source:" text skeleton */}
        <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
        {/* File Name skeleton */}
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded font-mono" />
        {/* Dot separator */}
        <span className="text-slate-300 dark:text-slate-700 text-[10px] sm:text-xs">
          •
        </span>
        {/* File Size skeleton */}
        <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export default Skeleton;
