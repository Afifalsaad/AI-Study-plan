import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";

// Allow up to 60 seconds for Gemini API calls (PDF processing can be slow)
export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userIdValue = formData.get("userId");
    const userId =
      typeof userIdValue === "string" && userIdValue.trim()
        ? Number(userIdValue)
        : null;

    console.log("[PDF Upload] Received file:", file?.name, "size:", file?.size, "userId:", userId);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to array buffer, then to Buffer and base64 string
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const prompt =
      "You are an expert study assistant. Below is the uploaded PDF document. Generate a structured summary including Overview, Key Takeaways, Core Concepts, and Recommended Next Steps in Markdown format. Keep the headings clear and use markdown lists for takeaways and concepts.";

    console.log("[PDF Upload] Calling Gemini API with model: gemini-2.5-flash, base64 length:", base64Data.length);

    // Generate content using Gemini 2.0 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf",
          },
        },
        prompt,
      ],
    });

    console.log("[PDF Upload] Gemini API response received");
    const summaryText = response.text || "Failed to generate summary.";

    const fileSizeKB = (file.size / 1024).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const fileSizeStr =
      file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;
    const title = file.name.replace(/\.pdf$/i, "");

    console.log("[PDF Upload] Saving to database, title:", title, "userId:", userId);

    const newConversation = await prisma.summary.create({
      data: {
        title: title,
        userId: userId,
        fileName: title,
        fileSize: fileSizeStr,
        summaryText: summaryText,
      },
    });
    const newConvId = newConversation.id;

    console.log("[PDF Upload] Success, conversationId:", newConvId);

    return NextResponse.json({
      success: true,
      conversationId: newConvId,
      summary: summaryText,
    });
  } catch (error: unknown) {
    console.error("[PDF Upload] Error summarizing PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to summarize PDF";
    if (error instanceof Error && error.stack) {
      console.error("[PDF Upload] Error stack:", error.stack);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  const session = await getServerSession(authOptions);
  const userIdValue = session?.user?.id;
  const userId =
    typeof userIdValue === "string" && userIdValue.trim()
      ? Number(userIdValue)
      : null;

  if (!userId || isNaN(userId)) {
    return NextResponse.json([]);
  }

  try {
    const summaries = await prisma.summary.findMany({
      where: {
        userId: userId,
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
    });
    return NextResponse.json(summaries);
  } catch (error: unknown) {
    console.error("Error fetching summaries:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch summaries";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
