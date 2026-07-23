import type { Metadata } from "next";
import StudyInput from '@/components/StudyPlan/StudyInput';

export const metadata: Metadata = {
  title: "Study Plan",
};

const page = () => {
    return (
        <div>
            <StudyInput></StudyInput>
        </div>
    );
};

export default page;