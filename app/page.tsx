import type { Metadata } from "next";
import Home from "@/components/Home";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <main>
          <Home></Home>
        </main>
      </Suspense>
    </div>
  );
}
