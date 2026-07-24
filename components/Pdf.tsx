"use client";
import axios from "axios";
import { CloudDownload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { Progress } from "./ui/progress";
import { Field, FieldLabel } from "./ui/field";
import { useSession } from "next-auth/react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import toast from "react-hot-toast";

const extractTextFromPdf = async (file: File): Promise<string> => {
  if (
    typeof window !== "undefined" &&
    !(window as { pdfjsLib?: typeof import("pdfjs-dist") }).pdfjsLib
  ) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
      script.onload = () => {
        try {
          // Use Blob URL workaround to load worker cross-origin in Safari/iOS
          const workerCode = `importScripts("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js");`;
          const blob = new Blob([workerCode], {
            type: "application/javascript",
          });
          const workerUrl = URL.createObjectURL(blob);
          (
            window as { pdfjsLib?: typeof import("pdfjs-dist") }
          ).pdfjsLib!.GlobalWorkerOptions.workerSrc = workerUrl;
          resolve(true);
        } catch (e) {
          reject(e);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const pdfjsLib = (window as { pdfjsLib?: typeof import("pdfjs-dist") })
    .pdfjsLib;
  const arrayBuffer = await file.arrayBuffer();
  if (!pdfjsLib) {
    throw new Error("Failed to load pdfjsLib.");
  }
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
};

const Pdf = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState<boolean | null>(false);
  const [loading, setLoading] = useState<boolean | null>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(0);
  const [status, setStatus] = useState<string | null>("");
  const session = useSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const user = session?.status == "authenticated";

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

  const handleFile = async (file: File) => {
    if (!user) {
      setAuthMode("login");
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (file && isPdf) {
      // Client-side file size validation (20MB limit)
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        toast.error(`File too large (${sizeMB} MB). Maximum size is 20MB.`);
        return;
      }

      setFileName(file.name);
      setIsUploaded(true);
      setLoading(true);
      setUploadProgress(0);
      setStatus("Preparing upload...");

      if (!user) {
        setIsOpen(true);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("userId", session?.data?.user?.id || "");

        // Extract text in client side to bypass serverless payload limits and mobile upload issues
        setStatus("Extracting text from PDF...");

        try {
          const extractedText = await extractTextFromPdf(file);
          formData.append("text", extractedText);
          formData.append("fileName", file.name);
          formData.append("fileSize", file.size.toString());
          setUploadProgress(50);
        } catch (err) {
          console.error(
            "Client-side PDF extraction failed, falling back to direct upload",
            err
          );
          // formData.append("file", file);
        }

        setStatus("Sending to server...");
        const res = await axios.post("/api/summarize", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || file.size)
            );

            setUploadProgress(percent);

            if (percent === 100) {
              setStatus("Processing on server...");
            }
          },
        });

        setStatus("Generating summary...");
        const { conversationId } = res.data;
        localStorage.setItem("active_conv_id", conversationId.toString());
        setLoading(false);
        router.push("/summary");
      } catch (error: unknown) {
        console.error("Error uploading PDF:", error);
        setLoading(false);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        // Check if it's a quota error from the API
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "data" in error.response &&
          typeof error.response.data === "object" &&
          error.response.data !== null &&
          "quotaExceeded" in error.response.data
        ) {
          toast.error(
            "Gemini API quota exceeded. Please try again later or upgrade your plan."
          );
        } else {
          toast.error("Failed to summarize PDF: " + errorMessage);
        }
      }
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (!user) {
      setIsOpen(true);
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (!user) {
      setAuthMode("login");
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="mt-16 relative mx-auto max-w-5xl">
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="application/pdf"
          onChange={handleChange}
        />

        {/* Upload Dropzone Container */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`h-110 bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-in-out cursor-pointer group
            ${
              isDragActive || isUploaded
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]"
                : "border-white dark:border-gray-800 dark:shadow-indigo-500/10"
            }`}>
          {loading ? (
            <Field className="w-full max-w-sm px-6 text-indigo-900 dark:text-indigo-200">
              <FieldLabel htmlFor="progress-upload">
                <span>{status}</span>
                <span className="ml-auto">{uploadProgress}%</span>
              </FieldLabel>
              <Progress value={uploadProgress ?? 0} id="progress-upload" />
            </Field>
          ) : (
            <div className="flex flex-col items-center space-y-4 p-6 text-center">
              <div className="p-4 bg-white/80 dark:bg-gray-800 rounded-full shadow-md text-indigo-500 group-hover:scale-110 transition-transform duration-700 ease-in-out">
                <CloudDownload />
              </div>
              <div className="space-y-1">
                <p className="text-indigo-900 dark:text-indigo-200 font-semibold text-lg">
                  {fileName ? "Selected File:" : "Drag & Drop your PDF here"}
                </p>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xl break-all px-4">
                  {fileName ? fileName : "or click to browse"}
                </p>
                {!fileName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supports PDF files up to 20MB
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </form>

      {/* ================= AUTH MODALS SYSTEM ================= */}

      <LoginForm
        isOpen={authMode === "login"}
        onOpenChange={(open) => setAuthMode(open ? "login" : null)}
        onSwitchToRegister={() => {
          setAuthMode(null);
          setTimeout(() => setAuthMode("register"), 250);
        }}
      />

      <RegisterForm
        isOpen={authMode === "register"}
        onOpenChange={(open) => setAuthMode(open ? "register" : null)}
        onSwitchToLogin={() => {
          setAuthMode(null);
          setTimeout(() => setAuthMode("login"), 250);
        }}
      />
    </div>
  );
};

export default Pdf;
