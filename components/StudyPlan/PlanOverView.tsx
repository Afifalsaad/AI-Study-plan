"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Target,
  Lightbulb,
  ClipboardCheck,
  RefreshCcw,
  GraduationCap,
} from "lucide-react";

type StudyData = {
  summary: {
    currentLevel: string;
    dailyStudyHours: number;
    daysRemaining: number;
    examName: string;
    goal: string;
  };
  strategy: {
    focusAreas: string[];
    recommendations: string[];
    weakTopicsPriority: string[];
  };
  studyPlan: {
    phase: string;
    duration: string;
    objectives: string[];
    dailyTasks: string[];
  }[];
  weeklySchedule: {
    week: string;
    targets: string[];
    subjects: string[];
  }[];
  revisionPlan: string[];
  mockTestPlan: string[];
  tips: string[];
};

interface StudyPlanPopoverProps {
  data: StudyData;
}

export default function PlanOverView({ data }: StudyPlanPopoverProps) {
  return (
    <Popover>
      {/* <PopoverTrigger asChild>
        <Button className="rounded-2xl shadow-sm">
          <BookOpen className="mr-2 h-4 w-4" />
          View Study Plan
        </Button>
      </PopoverTrigger> */}

      <PopoverContent
        align="end"
        className="w-[min(95vw,760px)] rounded-2xl border bg-background p-0 shadow-xl">
        <div className="border-b p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {data.summary.examName} Preparation Plan
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Goal: {data.summary.goal}
              </p>
            </div>

            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
              {data.summary.currentLevel}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoCard
              icon={<Clock className="h-4 w-4" />}
              label="Daily Study"
              value={`${data.summary.dailyStudyHours} hours`}
            />
            <InfoCard
              icon={<CalendarDays className="h-4 w-4" />}
              label="Days Remaining"
              value={`${data.summary.daysRemaining} days`}
            />
            <InfoCard
              icon={<Target className="h-4 w-4" />}
              label="Main Goal"
              value={data.summary.goal}
            />
          </div>
        </div>

        <ScrollArea className="h-[70vh]">
          <div className="space-y-6 p-5">
            {/* Strategy */}
            <Section
              icon={<Target className="h-5 w-5" />}
              title="Strategy"
              description="Focus areas, recommendations and priority topics">
              <SubSection
                title="Focus Areas"
                items={data.strategy.focusAreas}
              />
              <SubSection
                title="Recommendations"
                items={data.strategy.recommendations}
              />
              <SubSection
                title="Weak Topics Priority"
                items={data.strategy.weakTopicsPriority}
              />
            </Section>

            <Separator />

            {/* Study Plan */}
            <Section
              icon={<GraduationCap className="h-5 w-5" />}
              title="Study Plan"
              description="Phase-wise preparation structure">
              <div className="space-y-4">
                {data.studyPlan.map((plan, index) => (
                  <Card key={index} className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="font-semibold">{plan.phase}</h4>
                        <Badge variant="outline" className="w-fit rounded-full">
                          {plan.duration}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <SubSection
                          title="Objectives"
                          items={plan.objectives}
                        />
                        <SubSection
                          title="Daily Tasks"
                          items={plan.dailyTasks}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>

            <Separator />

            {/* Weekly Schedule */}
            <Section
              icon={<CalendarDays className="h-5 w-5" />}
              title="Weekly Schedule"
              description="Week-by-week target plan">
              <div className="grid gap-3">
                {data.weeklySchedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border bg-muted/30 p-4">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="font-medium">{schedule.week}</h4>
                      <div className="flex flex-wrap gap-2">
                        {schedule.subjects.map((subject, subIndex) => (
                          <Badge
                            key={subIndex}
                            variant="secondary"
                            className="rounded-full">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {schedule.targets.map((target, targetIndex) => (
                        <li key={targetIndex} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{target}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            <Separator />

            {/* Revision Plan */}
            <Section
              icon={<RefreshCcw className="h-5 w-5" />}
              title="Revision Plan"
              description="Daily, weekly and monthly revision routine">
              <NumberedList items={data.revisionPlan} />
            </Section>

            <Separator />

            {/* Mock Test Plan */}
            <Section
              icon={<ClipboardCheck className="h-5 w-5" />}
              title="Mock Test Plan"
              description="Practice tests and post-test analysis">
              <NumberedList items={data.mockTestPlan} />
            </Section>

            <Separator />

            {/* Tips */}
            <Section
              icon={<Lightbulb className="h-5 w-5" />}
              title="Tips"
              description="Helpful habits for long-term preparation">
              <NumberedList items={data.tips} />
            </Section>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function SubSection({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;

  return (
    <div>
      <h5 className="mb-2 text-sm font-semibold">{title}</h5>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-3 rounded-2xl border p-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {index + 1}
          </div>
          <p className="text-sm text-muted-foreground">{item}</p>
        </div>
      ))}
    </div>
  );
}
