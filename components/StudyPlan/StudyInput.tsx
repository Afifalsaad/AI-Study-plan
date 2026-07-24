"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  Clock,
  BrainCircuit,
  Target,
  FileText,
  CheckCircle2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const extractTextFromPdf = async (file: File): Promise<string> => {
  interface PdfJsLib {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument: (params: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (pageNumber: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> };
  }

  if (typeof window !== "undefined" && !(window as { pdfjsLib?: PdfJsLib }).pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
      script.onload = () => {
        ((window as unknown) as { pdfjsLib: PdfJsLib }).pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        resolve(true);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const pdfjsLib = (window as { pdfjsLib?: PdfJsLib }).pdfjsLib;
  const arrayBuffer = await file.arrayBuffer();
  if (!pdfjsLib) {
    throw new Error("pdfjsLib is not loaded or undefined.");
  }
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: { str: string }) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
};

interface FormData {
  syllabusPdf: File | null;
  name: string;
  examName: string;
  examDate: string;
  dailyTime: string;
  level: string;
  subjects: string;
  weakTopics: string;
  syllabus: string;
  goal: string;
  userId: string;
}

const StudyInput = () => {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const userId = session?.data?.user?.id || null;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    examName: "".toLowerCase(),
    examDate: "",
    dailyTime: "",
    level: "",
    subjects: "",
    weakTopics: "",
    syllabus: "",
    syllabusPdf: null,
    goal: "",
    userId: userId || "",
  });

  const handleChange = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setOpen(true);
    console.log(formData);
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setOpen(false);

      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("examName", formData.examName);
      dataToSend.append("examDate", formData.examDate);
      dataToSend.append("dailyTime", formData.dailyTime);
      dataToSend.append("level", formData.level);
      dataToSend.append("subjects", formData.subjects);
      dataToSend.append("weakTopics", formData.weakTopics);
      dataToSend.append("syllabus", formData.syllabus);
      dataToSend.append("goal", formData.goal);
      dataToSend.append("userId", String(formData.userId || userId || ""));

      if (formData.syllabusPdf) {
        try {
          const text = await extractTextFromPdf(formData.syllabusPdf);
          dataToSend.append("syllabusText", text);
        } catch (err) {
          console.error("Failed to parse syllabus PDF on client, sending as file", err);
          dataToSend.append("syllabusPdf", formData.syllabusPdf);
        }
      }

      await axios.post("/api/study_plan", dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/overview");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-700">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-[3px]">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Generating Study Plan...</span>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden py-12 md:py-16">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-16 left-8 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-600/10" />
          <div className="absolute bottom-16 right-8 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-600/10" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight dark:text-white md:text-4xl text-gradient-to-r from-indigo-600 to-purple-600 ">
              Create Your Smart Study Plan
            </h1>

            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400 md:text-lg">
              Provide your exam date, subjects, weak areas, and daily study
              time, and AI will generate a personalized study schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Info Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 rounded-3xl border-gray-200 bg-accent shadow-xl shadow-indigo-500/5 backdrop-blur dark:border-gray-800 ">
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-500/20">
                    <BrainCircuit className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <CardTitle className="text-2xl text-gray-900 dark:text-white">
                    How AI Plan Works
                  </CardTitle>

                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    AI will analyze your provided information and create a smart
                    routine for you.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-gray-950">
                    <CalendarCheck className="mt-0.5 h-5 w-5 text-indigo-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Exam Based Planning
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        The daily task will be based on your exam date.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-gray-950">
                    <Target className="mt-0.5 h-5 w-5 text-purple-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Weak Topic Priority
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Weak subjects will get the most focus in your routine.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-gray-950">
                    <Clock className="mt-0.5 h-5 w-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Time Optimized
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        The routine can be adjusted based on your available
                        time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form Card */}
            <div className="lg:col-span-2">
              <Card className="rounded-3xl border-gray-200 bg-accent shadow-2xl shadow-indigo-500/5 dark:border-gray-800 ">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="flex items-center gap-2 text-2xl text-gray-900 dark:text-white">
                    <FileText className="h-6 w-6 text-indigo-500" />
                    Study Information
                  </CardTitle>
                  <CardDescription>
                    Provide the following information and you will be ready to
                    generate an AI plan.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name + Exam */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="capitalize">Your Name</Label>
                        <Input
                          placeholder="Example: Afif"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="h-12 rounded-xl border-b-black/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="capitalize">Exam Name</Label>
                        <Input
                          placeholder="Example: HSC Final / Admission Test"
                          value={formData.examName}
                          onChange={(e) =>
                            handleChange("examName", e.target.value)
                          }
                          className="h-12 rounded-xl border-b-black/20"
                        />
                      </div>
                    </div>

                    {/* Exam Date + Daily Time */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="capitalize">Exam Date</Label>
                        <Input
                          type="date"
                          value={formData.examDate}
                          onChange={(e) =>
                            handleChange("examDate", e.target.value)
                          }
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="capitalize">Daily Study Time</Label>
                        <Select
                          value={formData.dailyTime}
                          onValueChange={(value) =>
                            handleChange("dailyTime", value)
                          }>
                          <SelectTrigger className="h-12 rounded-xl border-b-black/20">
                            <SelectValue placeholder="Select daily time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1 hour">1 hour</SelectItem>
                            <SelectItem value="2 hours">2 hours</SelectItem>
                            <SelectItem value="3 hours">3 hours</SelectItem>
                            <SelectItem value="4 hours">4 hours</SelectItem>
                            <SelectItem value="5+ hours">5+ hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Level + Subjects */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="capitalize">Current Level</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(value) =>
                            handleChange("level", value)
                          }>
                          <SelectTrigger className="h-14 rounded-xl border-b-black/20">
                            <SelectValue placeholder="Select your level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="capitalize">Subjects</Label>
                        <Input
                          placeholder="Example: Physics, Math, Chemistry"
                          value={formData.subjects}
                          onChange={(e) =>
                            handleChange("subjects", e.target.value)
                          }
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Weak Topics */}
                    <div className="space-y-2">
                      <Label className="capitalize">Weak Topics</Label>
                      <Textarea
                        placeholder="Example: Trigonometry, Organic Chemistry, Electricity"
                        value={formData.weakTopics}
                        onChange={(e) =>
                          handleChange("weakTopics", e.target.value)
                        }
                        className="min-h-5 rounded-xl border-b-black/20"
                      />
                    </div>

                    {/* Syllabus */}
                    <div className="space-y-3">
                      <Label className="capitalize">
                        Syllabus / Chapter List
                      </Label>
                      <Textarea
                        placeholder="Write your chapter list or syllabus topics here..."
                        value={formData.syllabus}
                        onChange={(e) =>
                          handleChange("syllabus", e.target.value)
                        }
                        className="min-h-6 border-b-black/20 rounded-xl"
                      />

                      <div className="relative rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 p-5 transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) =>
                            handleChange(
                              "syllabusPdf",
                              e.target.files?.[0] || null
                            )
                          }
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />

                        <div className="flex flex-col items-center justify-center text-center">
                          {formData.syllabusPdf ? (
                            <>
                              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-gray-900">
                                <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm dark:bg-gray-900 dark:text-indigo-400">
                                Selected: {formData.syllabusPdf.name}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-gray-900">
                                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Upload syllabus PDF
                              </p>

                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Click here or drag your PDF file to upload
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        You can write your chapter list manually or upload a PDF
                        syllabus.
                      </p>
                    </div>

                    {/* Goal */}
                    <div className="space-y-2">
                      <Label className="capitalize">Study Goal</Label>
                      <Textarea
                        placeholder="Example: I want to finish full syllabus before exam and revise twice."
                        value={formData.goal}
                        onChange={(e) => handleChange("goal", e.target.value)}
                        className="min-h-5 border-b-black/20 rounded-xl"
                      />
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        type="submit"
                        size="lg"
                        className="rounded-xl bg-indigo-600 px-8 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 hover:cursor-pointer">
                        Generate Plan Preview
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl bg-accent">
          <DialogHeader>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-500/20">
              <CheckCircle2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>

            <DialogTitle className="text-2xl capitalize">
              Your Study Plan Input Preview
            </DialogTitle>

            <DialogDescription>
              Check your provided information below. If everything looks good,
              you can confirm and generate your AI study plan.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <PreviewItem label="Name" value={formData.name} />
            <PreviewItem label="Exam Name" value={formData.examName} />
            <PreviewItem label="Exam Date" value={formData.examDate} />
            <PreviewItem label="Daily Study Time" value={formData.dailyTime} />
            <PreviewItem label="Current Level" value={formData.level} />
            <PreviewItem label="Subjects" value={formData.subjects} />

            <div className="md:col-span-2">
              <PreviewItem label="Weak Topics" value={formData.weakTopics} />
            </div>

            <div className="md:col-span-2">
              <PreviewItem
                label="Syllabus / Chapter List"
                value={formData.syllabus}
              />
            </div>

            <div className="md:col-span-2">
              <PreviewItem
                label="Uploaded Syllabus PDF"
                value={formData.syllabusPdf?.name || ""}
              />
            </div>

            <div className="md:col-span-2">
              <PreviewItem label="Study Goal" value={formData.goal} />
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}>
              Edit Information
            </Button>

            <Button
              onClick={handleGenerate}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer">
              Confirm & Generate AI Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan over view */}
      {/* <PlanOverView data={data} /> */}
    </main>
  );
};

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
      <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default StudyInput;
