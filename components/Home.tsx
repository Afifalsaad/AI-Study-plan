"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BrainCircuit,
  BookOpen,
  Sparkles,
  Clock,
  CalendarCheck,
  Target,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import Pdf from "./Pdf";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function Home() {
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const [planItems, setPlanItems] = useState<string[]>([]);
  const [planLoaded, setPlanLoaded] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get("/api/study_plan");
        const planArray = res?.data?.data;
        const latestPlan = Array.isArray(planArray) ? planArray[0] : planArray;

        if (latestPlan?.data) {
          const data = latestPlan.data;

          // Try studyPlan phases first (up to 4 items)
          if (Array.isArray(data.studyPlan) && data.studyPlan.length > 0) {
            const items = data.studyPlan
              .slice(0, 4)
              .map(
                (p: {
                  phase?: string;
                  duration?: string;
                  description?: string;
                }) =>
                  [p.phase, p.duration].filter(Boolean).join(" — ") ||
                  p.description ||
                  "Study Phase"
              );
            setPlanItems(items);
          }
          // Fallback: first week of weeklySchedule tasks
          else if (
            Array.isArray(data.weeklySchedule) &&
            data.weeklySchedule.length > 0
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const firstWeek = data.weeklySchedule[0] as any;
            const tasks = Array.isArray(firstWeek?.tasks)
              ? firstWeek.tasks
                  .slice(0, 4)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((t: any) => t.title || t.description || "Task")
              : [];
            setPlanItems(tasks);
          }
        }
      } catch {
        // silent — fallback empty state is handled in render
      } finally {
        setPlanLoaded(true);
      }
    };
    fetchPlan();
  }, []);

  const scrollToUploadZone = () => {
    uploadZoneRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      title: "AI Study Planner",
      description:
        "Exam date, syllabus and time দেখে AI আপনার জন্য personalized daily study routine তৈরি করে।",
      icon: <CalendarCheck className="w-8 h-8 text-indigo-500" />,
      gradient:
        "from-indigo-500/10 to-indigo-100 dark:from-indigo-500/20 dark:to-indigo-950/40",
    },
    {
      title: "Chapter Summaries",
      description:
        "বড় chapter বা PDF থেকে important points, definitions এবং short notes তৈরি করুন।",
      icon: <BrainCircuit className="w-8 h-8 text-purple-500" />,
      gradient:
        "from-purple-500/10 to-purple-100 dark:from-purple-500/20 dark:to-purple-950/40",
    },
    {
      title: "Smart Revision",
      description:
        "AI আপনার দুর্বল topic identify করে revision priority সাজিয়ে দেয়।",
      icon: <Target className="w-8 h-8 text-blue-500" />,
      gradient:
        "from-blue-500/10 to-blue-100 dark:from-blue-500/20 dark:to-blue-950/40",
    },
    {
      title: "Progress Tracking",
      description:
        "Daily study progress, completed tasks এবং upcoming goals এক জায়গায় দেখুন।",
      icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
      gradient:
        "from-orange-500/10 to-orange-100 dark:from-orange-500/20 dark:to-orange-950/40",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-24 left-10 w-72 h-72 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Powered Study Planning
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                Plan Smarter,{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  Study Better
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                Upload your syllabus, notes or PDF. Our AI creates a focused
                study plan, summaries and revision tasks based on your exam
                deadline.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/study_plan">
                  <Button
                    size="lg"
                    className="text-base px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 hover:cursor-pointer">
                    Create Study Plan
                  </Button>
                </Link>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToUploadZone}
                  className="text-base px-7 rounded-xl dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 hover:cursor-pointer">
                  Upload PDF
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Free to start
                </div>
              </div>
            </div>

            {/* Right Preview Card */}
            <div className="relative">
              <Card className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 duration-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white">
                        Today&apos;s AI Plan
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Personalized tasks for your exam prep
                      </CardDescription>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                      <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {!planLoaded ? (
                    // Loading skeleton
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : planItems.length > 0 ? (
                    planItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {item}
                          </span>
                        </div>
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                    ))
                  ) : (
                    // Fallback — no plan created yet
                    <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6 text-indigo-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        No study plan yet.
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Create a plan to see your AI tasks here.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 pt-3">
                    <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 p-4 text-center">
                      <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {planItems.length || "—"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tasks
                      </p>
                    </div>

                    <div className="rounded-2xl bg-purple-50 dark:bg-purple-500/10 p-4 text-center">
                      <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        95m
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Study
                      </p>
                    </div>

                    <div className="rounded-2xl bg-green-50 dark:bg-green-500/10 p-4 text-center">
                      <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                        72%
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ready
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div ref={uploadZoneRef} className="mt-12">
            <Pdf />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Study with AI
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From planning to revision, StudyAI keeps your preparation organized,
            focused and exam-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 bg-gradient-to-br ${feature.gradient} transition-all duration-700 hover:-translate-y-2`}>
              <CardHeader>
                <div className="mb-5 w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 pt-2 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-3xl bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 py-14 px-6 text-center text-white shadow-2xl shadow-indigo-500/20">
          <BookOpen className="w-12 h-12 mx-auto mb-5 text-white/90" />

          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            Build Your Exam Plan in Minutes
          </h2>

          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Let AI organize your syllabus, daily routine, summaries and revision
            schedule — all in one place.
          </p>

          <Button
            size="lg"
            variant="secondary"
            className="rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 px-8">
            Start Planning Now
          </Button>
        </div>
      </section>
    </main>
  );
}
