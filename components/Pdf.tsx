"use client";
import { CloudDownload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

const Pdf = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState<boolean | null>(false);
  const [loading, setLoading] = useState<boolean | null>(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
      setIsUploaded(true);
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/summarize", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to summarize PDF");
        }

        const data = await res.json();
        const summaryText = data.summary as string;

        // Create a new conversation object
        const newConvId = `custom_${Date.now()}`;
        const fileSizeKB = (file.size / 1024).toFixed(1);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const fileSizeStr =
          file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;

        const newConv = {
          id: newConvId,
          title: file.name.replace(/\.pdf$/i, ""),
          fileName: file.name,
          fileSize: fileSizeStr,
          time: "Just now",
          active: true,
          summaryPreview: summaryText.substring(0, 80) + "...",
        };

        // Create the initial AI summary message
        const summaryMessage = {
          id: `m_${Date.now()}`,
          sender: "ai" as const,
          text: summaryText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Save to localStorage
        const existingConvs = JSON.parse(
          localStorage.getItem("custom_conversations") || "[]"
        );
        existingConvs.unshift(newConv);
        localStorage.setItem(
          "custom_conversations",
          JSON.stringify(existingConvs)
        );

        // Save messages keyed by conversation id
        const messagesMap = JSON.parse(
          localStorage.getItem("custom_messages_map") || "{}"
        );
        messagesMap[newConvId] = [summaryMessage];
        localStorage.setItem(
          "custom_messages_map",
          JSON.stringify(messagesMap)
        );

        // Store active conversation id for SummaryWrapper to pick up
        localStorage.setItem("active_conv_id", newConvId);

        setLoading(false);
        router.push("/Summary");
      } catch (error: unknown) {
        console.error("Error uploading PDF:", error);
        setLoading(false);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        alert("Failed to summarize PDF: " + errorMessage);
      }
    } else {
      alert("Please upload one PDF file");
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
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-16 relative mx-auto max-w-5xl">
      {/* Hidden File Input */}
      <form onSubmit={(e) => e.preventDefault()}>
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
          className={`aspect-video bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-in-out cursor-pointer group
      ${
        isDragActive || isUploaded
          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]"
          : "border-white dark:border-gray-800 dark:shadow-indigo-500/10"
      }`}>
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              {/* Tailwind CSS Spinner */}
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-md">
                Uploading your PDF, please wait...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 p-6 text-center">
              <div className="p-4 bg-white/80 dark:bg-gray-800 rounded-full shadow-md text-indigo-500 group-hover:scale-110 transition-transform duration-700 ease-in-out">
                <CloudDownload></CloudDownload>
              </div>
              {/* Texts */}
              <div className="space-y-1">
                <p className="text-indigo-900 dark:text-indigo-200 font-semibold text-lg">
                  {fileName ? "Selected File:" : "Drag & Drop your PDF here"}
                </p>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xl break-all px-4">
                  {fileName ? fileName : "or click to browse"}
                </p>
                {!fileName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supports PDF files up to 10MB
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Pdf;
