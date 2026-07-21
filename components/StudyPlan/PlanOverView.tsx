"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Target,
  Calendar,
  ClipboardCheck,
  RefreshCw,
  Lightbulb,
  Clock,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  Layers,
  Trophy,
  Loader2,
  FileText,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

type StudyPlanData = {
  id: string;
  examName: string;
  createdAt: string;
  updatedAt: string;
  data: {
    summary?: {
      goal?: string;
      examName?: string;
      currentLevel?: string;
      daysRemaining?: number;
      dailyStudyHours?: number;
      [key: string]: string | number | boolean | object | undefined;
    };
    strategy?: {
      focusAreas?: string[];
      recommendations?: string[];
      weakTopicsPriority?: string[];
      [key: string]: unknown;
    };
    studyPlan?: {
      phase: string;
      description: string;
      details?: string;
      [key: string]: string | number | boolean | undefined;
    }[];
    mockTestPlan?: { testName: string; date: string; score?: number }[];
    revisionPlan?: {
      title: string;
      description: string;
      [key: string]: string | number | boolean | object | undefined;
    }[];
    weeklySchedule?: {
      day: string;
      tasks: { title: string; description: string }[];
    }[];
    tips?: { title: string; description: string }[];
    [key: string]: string | number | boolean | object | undefined;
  };
};

const formatLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (date?: string) => {
  if (!date) return "Not available";
  try {
    return new Date(date).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

const isEmpty = (
  value: string | number | boolean | null | undefined | object | unknown[]
) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return true;
  }
  return false;
};

const RenderValue = ({
  value,
}: {
  value: string | number | boolean | null | undefined | object | unknown[];
}) => {
  if (isEmpty(value)) {
    return (
      <span className="text-sm text-gray-400 dark:text-gray-500 italic">
        No data available
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm leading-relaxed">
            <RenderValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-3">
        {value &&
          typeof value === "object" &&
          Object.entries(value).map(([key, val]) => (
            <div
              key={key}
              className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                {formatLabel(key)}
              </p>
              <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <RenderValue value={val} />
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {String(value)}
    </span>
  );
};

const LoadingView = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc] dark:bg-gray-950">
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-10 shadow-2xl shadow-indigo-500/10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Loading your study plan...
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please wait while we prepare your roadmap.
          </p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({
  title = "No data available",
  description = "There is no information to show here.",
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
        <AlertCircle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
};

const SectionCard = ({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
}) => {
  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string | number | boolean | null | undefined | object | unknown[];
  icon: React.ReactNode;
  gradient: string;
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-linear-to-br ${gradient} p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 dark:bg-black/20 backdrop-blur-sm">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
        {isEmpty(value) ? (
          <span className="text-sm font-normal text-gray-400">N/A</span>
        ) : (
          String(value)
        )}
      </div>
    </div>
  );
};

export default function PlanOverview() {
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/api/study_plan");
        const planArray = res?.data?.data;
        const responsePlan = Array.isArray(planArray)
          ? planArray[0]
          : planArray;
        console.log(res?.data);

        setPlan(responsePlan);
      } catch (error) {
        console.log("Study plan loading error:", error);
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingView />;
  }

  if (!plan) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc] dark:bg-gray-950 p-4">
        <div className="w-full max-w-2xl">
          <EmptyState
            title="No study plan found"
            description="No study plan was found. Please create a study plan first."
          />
        </div>
      </div>
    );
  }

  const summary = plan?.data?.summary;
  const strategy = plan?.data?.strategy;

  const studyPlan = Array.isArray(plan?.data?.studyPlan)
    ? plan.data.studyPlan
    : [];

  const mockTestPlan = Array.isArray(plan?.data?.mockTestPlan)
    ? plan.data.mockTestPlan
    : [];

  const revisionPlan = Array.isArray(plan?.data?.revisionPlan)
    ? plan.data.revisionPlan
    : [];

  const weeklySchedule = Array.isArray(plan?.data?.weeklySchedule)
    ? plan.data.weeklySchedule
    : [];

  const tips = Array.isArray(plan?.data?.tips) ? plan.data.tips : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-700">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        {/* ─── Hero Header ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-500  to-purple-300 dark:from-indigo-800 dark:via-indigo-900 dark:to-purple-900 text-white shadow-2xl shadow-indigo-500/30">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-center">
              {/* Left */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/20">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  Personalized AI Study Roadmap
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                  {plan?.examName || summary?.examName || "Study Plan"}
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-100 md:text-base">
                  A complete preparation dashboard with strategy, study phases,
                  mock tests, revision plan, weekly schedule, and smart tips.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
                    <Shield className="h-3.5 w-3.5" />
                    ID: {plan?.id?.slice(0, 12) || "N/A"}...
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {plan?.examName || "N/A"}
                  </span>
                  {summary?.currentLevel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/20 border border-yellow-300/30 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-300" />
                      {summary.currentLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Right — meta cards */}
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-indigo-200 uppercase tracking-wide">
                      Created At
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {formatDate(plan?.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-indigo-200 uppercase tracking-wide">
                      Updated At
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {formatDate(plan?.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Trophy className="h-4 w-4 text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-indigo-200 uppercase tracking-wide">
                      Level
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {summary?.currentLevel || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Quick Stats ─────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Goal"
            value={summary?.goal}
            icon={
              <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            }
            gradient="from-indigo-50 to-white dark:from-indigo-500/10 dark:to-gray-900"
          />
          <StatCard
            label="Days Remaining"
            value={summary?.daysRemaining}
            icon={
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            }
            gradient="from-purple-50 to-white dark:from-purple-500/10 dark:to-gray-900"
          />
          <StatCard
            label="Daily Study Hours"
            value={
              summary?.dailyStudyHours ? `${summary.dailyStudyHours}h` : null
            }
            icon={
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            }
            gradient="from-blue-50 to-white dark:from-blue-500/10 dark:to-gray-900"
          />
          <StatCard
            label="Exam Name"
            value={summary?.examName || plan?.examName}
            icon={
              <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            }
            gradient="from-emerald-50 to-white dark:from-emerald-500/10 dark:to-gray-900"
          />
        </div>

        {/* ─── Summary ─────────────────────────────────────────────── */}
        <SectionCard
          title="Summary"
          description="Overall exam preparation summary at a glance."
          icon={<FileText className="h-5 w-5" />}>
          {summary ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(summary).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-4 transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-800">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                    {formatLabel(key)}
                  </p>
                  <div className="mt-2 font-semibold text-gray-900 dark:text-white">
                    <RenderValue value={value} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="Summary information is not available." />
          )}
        </SectionCard>

        {/* ─── Strategy ────────────────────────────────────────────── */}
        <SectionCard
          title="Strategy"
          description="Focus areas, recommendations, and priority weak topics."
          icon={<Target className="h-5 w-5" />}>
          {strategy ? (
            <div className="space-y-6">
              {/* Focus Areas */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                  Focus Areas
                </h3>
                {strategy?.focusAreas?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {strategy.focusAreas.map((item, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-3.5 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No focus areas available.
                  </p>
                )}
              </div>

              <Separator className="dark:border-gray-800" />

              {/* Recommendations */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  Recommendations
                </h3>
                {strategy?.recommendations?.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {strategy.recommendations.map((item, index) => (
                      <div
                        key={index}
                        className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-linear-to-br from-purple-50/60 to-white dark:from-purple-500/5 dark:to-gray-900 p-4 text-sm leading-relaxed transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-400">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                            Recommendation
                          </span>
                        </div>
                        <RenderValue value={item} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No recommendations available.
                  </p>
                )}
              </div>

              <Separator className="dark:border-gray-800" />

              {/* Weak Topics */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  Weak Topics Priority
                </h3>
                {strategy?.weakTopicsPriority?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {strategy.weakTopicsPriority.map((item, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 px-3.5 py-1.5 text-sm font-medium text-rose-700 dark:text-rose-300">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No weak topics available.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState description="Strategy information is not available." />
          )}
        </SectionCard>

        {/* ─── Study Plan ──────────────────────────────────────────── */}
        <SectionCard
          title="Study Plan"
          description="Phase-wise study roadmap from start to exam day."
          icon={<Layers className="h-5 w-5" />}>
          {studyPlan.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {studyPlan.map((phase, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800">
                  {/* Top accent bar */}
                  <div className="h-1 w-full bg-linear-to-r from-indigo-500 to-purple-500" />
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {index + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          Phase {index + 1}
                        </span>
                      </div>
                      <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                        Study
                      </span>
                    </div>
                    <RenderValue value={phase} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="Study plan data is not available." />
          )}
        </SectionCard>

        {/* ─── Mock Test Plan ──────────────────────────────────────── */}
        <SectionCard
          title="Mock Test Plan"
          description="Practice test schedule and exam simulation plan."
          icon={<ClipboardCheck className="h-5 w-5" />}>
          {mockTestPlan.length ? (
            <div className="space-y-4">
              {mockTestPlan.map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md hover:shadow-emerald-500/10">
                  <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-emerald-400 to-teal-500 rounded-l-2xl" />
                  <div className="pl-3">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Mock Test {index + 1}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Practice and performance analysis
                        </p>
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed">
                      <RenderValue value={item} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="Mock test plan is not available." />
          )}
        </SectionCard>

        {/* ─── Revision Plan ───────────────────────────────────────── */}
        <SectionCard
          title="Revision Plan"
          description="Daily, weekly, monthly, and targeted revision structure."
          icon={<RefreshCw className="h-5 w-5" />}>
          {revisionPlan.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {revisionPlan.map((item, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-linear-to-br from-blue-50/60 to-white dark:from-blue-500/5 dark:to-gray-900 p-5 shadow-sm transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/10">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-sm font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Revision Step {index + 1}
                    </h3>
                  </div>
                  <RenderValue value={item} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="Revision plan is not available." />
          )}
        </SectionCard>

        {/* ─── Weekly Schedule ─────────────────────────────────────── */}
        <SectionCard
          title="Weekly Schedule"
          description="Weekly study distribution and routine breakdown."
          icon={<Calendar className="h-5 w-5" />}>
          {weeklySchedule.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {weeklySchedule.map((day, index) => (
                <div
                  key={index}
                  className="group overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-800">
                  <div className="h-1 w-full bg-linear-to-r from-purple-400 to-pink-400" />
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-400">
                          {index + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          Week {index + 1}
                        </span>
                      </div>
                      <span className="rounded-full bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        Schedule
                      </span>
                    </div>
                    <RenderValue value={day} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="Weekly schedule is not available." />
          )}
        </SectionCard>

        {/* ─── Smart Tips ──────────────────────────────────────────── */}
        <SectionCard
          title="Smart Tips"
          description="Helpful suggestions to improve your consistency and performance."
          icon={<Lightbulb className="h-5 w-5" />}>
          {tips.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-linear-to-br from-amber-50 to-white dark:from-amber-500/5 dark:to-gray-900 p-4 text-sm leading-relaxed shadow-sm transition-all duration-300 hover:border-amber-200 dark:hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/10">
                  <div className="mb-2.5 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Tip {index + 1}
                    </span>
                  </div>
                  <RenderValue value={tip} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="No smart tips available." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}