import type { Metadata } from "next";
import PlanOverView from "@/components/StudyPlan/PlanOverView";

export const metadata: Metadata = {
  title: "Overview",
};

const page = () => {
  return (
    <div>
      <PlanOverView></PlanOverView>
      {/* This is overview page */}
    </div>
  );
};

export default page;
