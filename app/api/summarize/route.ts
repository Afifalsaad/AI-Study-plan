"use server";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userIdValue = formData.get("userId");
    const userId =
      typeof userIdValue === "string" && userIdValue.trim()
        ? Number(userIdValue)
        : null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to array buffer, then to Buffer and base64 string
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const prompt =
      "You are an expert study assistant. Below is the uploaded PDF document. Generate a structured summary including Overview, Key Takeaways, Core Concepts, and Recommended Next Steps in Markdown format. Keep the headings clear and use markdown lists for takeaways and concepts.";

    // Generate content using Gemini 2.5 Flash
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

    const summaryText = response.text || "Failed to generate summary.";

    const fileSizeKB = (file.size / 1024).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const fileSizeStr =
      file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;
    const title = file.name.replace(/\.pdf$/i, "");

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

    return NextResponse.json({
      success: true,
      conversationId: newConvId,
      summary: summaryText,
    });
  } catch (error: unknown) {
    console.error("Error summarizing PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to summarize PDF";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  console.log("from GET function", search);
  const session = await getServerSession(authOptions);
  const userIdValue = session?.user?.id;
  const userId =
    typeof userIdValue === "string" && userIdValue.trim()
      ? Number(userIdValue)
      : null;
  try {
    const summaries = await prisma.summary.findMany({
      where: {
        userId: userId!,
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
