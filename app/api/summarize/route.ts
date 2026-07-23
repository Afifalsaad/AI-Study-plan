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

    if (!process.env.GEMINI_API_KEY) {
      console.error("[PDF Upload] GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    // Convert file to array buffer, then to Buffer and base64 string
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const prompt =
      "You are an expert study assistant. Below is the uploaded PDF document. Generate a structured summary including Overview, Key Takeaways, Core Concepts, and Recommended Next Steps in Markdown format. Keep the headings clear and use markdown lists for takeaways and concepts.";

    console.log("[PDF Upload] Calling Gemini API with model: gemini-2.0-flash, base64 length:", base64Data.length);

    // Generate content using Gemini 2.0 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: "application/pdf",
              },
            },
            {
              text: prompt,
            },
          ],
        },
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

    // Check if it's a quota/rate-limit error from Gemini
    const isQuotaError =
      error instanceof Error &&
      (error.message.includes("429") ||
        error.message.includes("RESOURCE_EXHAUSTED") ||
        error.message.includes("quota") ||
        error.message.includes("rate limit"));

    if (isQuotaError) {
      console.error("[PDF Upload] Gemini API quota exceeded");
      return NextResponse.json(
        {
          error: "Gemini API quota exceeded. Please try again later or upgrade your plan.",
          quotaExceeded: true,
        },
        { status: 429 }
      );
    }

    if (error instanceof Error && error.stack) {
      console.error("[PDF Upload] Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      },
      { status: 500 }
    );
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
