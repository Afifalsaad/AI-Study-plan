import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";

// Allow up to 120 seconds for large PDF processing
export const maxDuration = 120;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Maximum file size: 20MB (Gemini File API supports up to 2GB, but we keep it reasonable)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Retry configuration for transient network errors
const MAX_UPLOAD_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Retries a function with exponential backoff for network errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = MAX_UPLOAD_RETRIES,
  delay = RETRY_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("ECONNRESET") ||
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("fetch failed") ||
        error.message.includes("network"));

    if (isNetworkError && retries > 0) {
      console.log(
        `[PDF Upload] Network error, retrying... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate critical environment variables
    const missingEnvVars: string[] = [];
    if (!process.env.GEMINI_API_KEY) {
      missingEnvVars.push("GEMINI_API_KEY");
    }
    if (!process.env.DATABASE_URL) {
      missingEnvVars.push("DATABASE_URL");
    }

    if (missingEnvVars.length > 0) {
      console.error(
        "[PDF Upload] Missing environment variables:",
        missingEnvVars.join(", ")
      );
      return NextResponse.json(
        {
          error: `Server configuration error: Missing environment variables: ${missingEnvVars.join(", ")}. Please check Netlify environment variables.`,
          missingVars: missingEnvVars,
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userIdValue = formData.get("userId");
    const userId =
      typeof userIdValue === "string" && userIdValue.trim()
        ? Number(userIdValue)
        : null;

    console.log(
      "[PDF Upload] Received file:",
      file?.name,
      "size:",
      file?.size,
      "userId:",
      userId
    );

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File too large (${sizeMB} MB). Maximum size is 20MB.` },
        { status: 400 }
      );
    }

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const prompt =
      "You are an expert study assistant. Below is the uploaded PDF document. Generate a structured summary including Overview, Key Takeaways, Core Concepts, and Recommended Next Steps in Markdown format. Keep the headings clear and use markdown lists for takeaways and concepts.";

    console.log(
      "[PDF Upload] Uploading file to Gemini File API, size:",
      file.size
    );

    // Upload file to Gemini File API with retry logic
    // Use File object instead of Blob for better Node.js compatibility
    const uploadedFile = await retryWithBackoff(async () => {
      // Create a File-like object for the SDK
      // In Node.js, we need to ensure the file data is properly formatted
      const fileForUpload = new File([buffer], file.name, {
        type: "application/pdf",
      });

      return await ai.files.upload({
        file: fileForUpload,
        config: {
          mimeType: "application/pdf",
          displayName: file.name,
        },
      });
    });

    if (!uploadedFile.name) {
      console.error("[PDF Upload] File upload failed - no name returned");
      return NextResponse.json(
        { error: "Failed to upload PDF file. Please try again." },
        { status: 500 }
      );
    }

    console.log(
      "[PDF Upload] File uploaded, URI:",
      uploadedFile.uri,
      "Waiting for processing..."
    );

    // Wait for file to be processed (polling) with retry
    let fileState = uploadedFile.state;
    let retries = 0;
    const maxRetries = 30; // 30 retries * 2s = 60s max wait

    while (fileState === "PROCESSING" && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const fileInfo = await ai.files.get({ name: uploadedFile.name });
      fileState = fileInfo.state;
      retries++;
      console.log(
        `[PDF Upload] File processing state: ${fileState} (attempt ${retries}/${maxRetries})`
      );
    }

    if (fileState === "FAILED") {
      console.error("[PDF Upload] File processing failed");
      return NextResponse.json(
        { error: "Failed to process PDF file. Please try again." },
        { status: 500 }
      );
    }

    if (fileState !== "ACTIVE") {
      console.error(
        "[PDF Upload] File processing timed out or unexpected state:",
        fileState
      );
      return NextResponse.json(
        {
          error:
            "PDF processing timed out. Please try again with a smaller file.",
        },
        { status: 500 }
      );
    }

    console.log(
      "[PDF Upload] File processed successfully, generating summary..."
    );

    // Generate content using the uploaded file
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          parts: [
            {
              fileData: {
                mimeType: "application/pdf",
                fileUri: uploadedFile.uri,
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

    console.log(
      "[PDF Upload] Saving to database, title:",
      title,
      "userId:",
      userId
    );

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

    // Extract detailed error information
    let errorMessage = "Failed to summarize PDF";
    let errorName = "UnknownError";
    let errorStack: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorName = error.name;
      errorStack = error.stack;

      // Check for specific error types
      if (error.message.includes("ECONNRESET") || error.message.includes("ETIMEDOUT")) {
        errorMessage = "Network error: Connection to Gemini API failed. Please try again.";
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Network error: Could not resolve Gemini API host. Please check your network.";
      } else if (error.message.includes("prisma") || error.message.includes("database")) {
        errorMessage = "Database error: Could not save summary. Please check database connection.";
      }
    }

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
          error:
            "Gemini API quota exceeded. Please try again later or upgrade your plan.",
          quotaExceeded: true,
        },
        { status: 429 }
      );
    }

    console.error("[PDF Upload] Error details:", {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: errorMessage,
        name: errorName,
        stack: errorStack,
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
