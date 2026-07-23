import type { Metadata } from "next";
import SummaryWrapper from "@/components/Summary/SummaryWrapper";

export const metadata: Metadata = {
  title: "Summary",
};

export default function SummaryPage() {
  return (
    <div className="fixed top-16 bottom-0 left-0 right-0 overflow-hidden flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-100 ease-in-out">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        html, body {
          overflow: hidden !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `,
        }}
      />

      {/* LEFT SIDEBAR - Conversation History */}
      <SummaryWrapper></SummaryWrapper>
    </div>
  );
}
