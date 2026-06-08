import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

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

    return NextResponse.json({
      summary: response.text || "Failed to generate summary.",
    });
  } catch (error) {
    console.error("Error summarizing PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to summarize PDF" },
      { status: 500 }
    );
  }
}
