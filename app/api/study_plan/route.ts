import authOptions from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Allow up to 60 seconds for Gemini API calls
export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    const formData = await req.formData();
    const file = formData.get("syllabusPdf") as File | null;
    const syllabusText = formData.get("syllabusText") as string | null;

    let base64Data = "";

    if (!syllabusText && file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString("base64");
    }

    const prompt = `You are an expert academic mentor and study planner.

Analyze the student's information carefully and create a highly personalized study plan.

Student Information:
- Name: ${formData.get("name")}
- Exam Name: ${formData.get("examName")}
- Exam Date: ${formData.get("examDate")}
- Daily Study Time Available: ${formData.get("dailyTime")}hours
- Current Preparation Level: ${formData.get("level")}
- Subjects: ${formData.get("subjects")}
- Weak Topics: ${formData.get("weakTopics")}
- Full Syllabus: ${formData.get("syllabus")}
- Goal/Target: ${formData.get("goal")}

Instructions:

1. Calculate how many days remain until the exam from created date.
2. Analyze the student's level, available study time, weak areas, syllabus size, and goal.
3. Create a realistic and achievable study plan from today until the exam date.
4. Prioritize weak topics while ensuring full syllabus coverage.
5. Divide preparation into phases:
   - Foundation Phase
   - Learning Phase
   - Practice Phase
   - Revision Phase
   - Final Mock Test Phase
6. Suggest daily and weekly study targets.
7. Allocate study hours per subject based on importance and weakness.
8. Include revision schedules and mock exam schedules.
9. Prevent burnout by recommending breaks and rest days.
10. If exam time is very short, create a compressed high-priority plan.
11. If exam time is long, create a balanced long-term plan.

Return ONLY valid JSON in the following structure:

{
  "summary": {
    "examName": "",
    "daysRemaining": 0,
    "dailyStudyHours": 0,
    "currentLevel": "",
    "goal": ""
  },
  "strategy": {
    "focusAreas": [],
    "weakTopicsPriority": [],
    "recommendations": []
  },
  "studyPlan": [
    {
      "phase": "",
      "duration": "",
      "objectives": [],
      "dailyTasks": []
    }
  ],
  "weeklySchedule": [
    {
      "week": "",
      "targets": [],
      "subjects": []
    }
  ],
  "revisionPlan": [],
  "mockTestPlan": [],
  "tips": []
}

Important:
- Output must be valid JSON only.
- Do not include markdown.
- Do not include explanations outside JSON.
- Make the study plan practical, realistic, and actionable.`;

    // Generate content using Gemini 2.5 Flash
    const contents: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [
      {
        text: prompt,
      },
    ];

    if (syllabusText) {
      contents.push({
        text: `Here is the syllabus text extracted from the PDF:\n\n${syllabusText}`,
      });
    } else if (base64Data) {
      contents.push({
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      });
    }

    // Generate the study plan using the AI model
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
    });

    const rawText = response.text ?? "";

    const cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const studyPlan = JSON.parse(cleanedText);

    // Attach the actual exam date so the overview can compute exact days remaining
    const examDateFromForm = formData.get("examDate") as string | null;
    const studyPlanWithDate = {
      ...studyPlan,
      examDate: examDateFromForm || null,
    };
    // Save generated data to DB
    await prisma.studyPlan.upsert({
      where: {
        userId_examName: {
          userId: Number(session?.user?.id),
          examName:
            studyPlan.summary?.examName || "Untitled Exam".toLowerCase(),
        },
      },
      update: {
        data: studyPlanWithDate,
      },
      create: {
        userId: Number(session?.user?.id),
        examName: studyPlan.summary?.examName || "Untitled Exam",
        data: studyPlanWithDate,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
      status: 500,
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const res = await prisma.studyPlan.findMany({
      where: {
        userId: Number(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({
      success: true,
      data: res,
    });
  } catch (error) {
    console.log("Error fetching study plan:", error);
    return NextResponse.json({
      success: false,
      data: [],
    });
  }
}
