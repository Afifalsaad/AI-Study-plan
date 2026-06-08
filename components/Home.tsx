import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BrainCircuit, BookOpen, Sparkles, Clock } from "lucide-react";
import Pdf from "./Pdf";

export default function Home() {
  const features = [
    {
      title: "AI Summarizer",
      description:
        "Upload any long chapter or PDF and let AI create a concise, easy-to-understand summary for you.",
      icon: (
        <BrainCircuit className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
      ),
      gradient:
        "from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/20 dark:to-indigo-600/10",
    },
    {
      title: "Smart Flashcards",
      description:
        "Automatically generate flashcards from your notes for quick and effective revision sessions.",
      icon: (
        <Sparkles className="w-10 h-10 text-purple-500 dark:text-purple-400" />
      ),
      gradient:
        "from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10",
    },
    {
      title: "24/7 Study Buddy",
      description:
        "Chat directly with your AI tutor anytime to solve any study-related problem instantly.",
      icon: <BookOpen className="w-10 h-10 text-blue-500 dark:text-blue-400" />,
      gradient:
        "from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10",
    },
    {
      title: "Study Planner",
      description:
        "Create a personalized study plan tailored to your exam schedule and learning goals.",
      icon: (
        <Clock className="w-10 h-10 text-orange-500 dark:text-orange-400" />
      ),
      gradient:
        "from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-orange-600/10",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Make Your Study{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Smarter
            </span>{" "}
            and Easier
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 transition-colors duration-300">
            Our AI assistant reads your notes, simplifies complex topics, and
            prepares you for exams in the shortest time possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-300">
              Start for Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-300">
              See How It Works
            </Button>
          </div>
        </div>
        <Pdf></Pdf>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Our Special Features
          </h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Everything you need in one place to supercharge your learning
            journey
          </p>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`border-none shadow-sm hover:shadow-lg dark:shadow-none dark:hover:shadow-indigo-500/5 bg-linear-to-br ${feature.gradient} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1`}>
              <CardHeader>
                <div className="mb-4 w-14 h-14 rounded-xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-sm transition-colors duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white transition-colors duration-300">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 pt-2 transition-colors duration-300">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div> */}
      </section>

      {/* Footer CTA */}
      <section className="bg-indigo-600 dark:bg-indigo-900/50 py-16 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">
            Join Today and Ace Your Preparation
          </h2>
          <p className="text-indigo-100 dark:text-indigo-200/70 mb-8 max-w-xl mx-auto">
            Thousands of students are already improving their results with
            StudyAI. Why stay behind?
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-indigo-600 hover:bg-indigo-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:border dark:border-white/20 transition-colors duration-300">
            Get Started Now
          </Button>
        </div>
      </section>
    </main>
  );
}
