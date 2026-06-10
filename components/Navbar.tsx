"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-white/80 dark:bg-slate-950 backdrop-blur-md sticky top-0 z-50 transition-colors duration-700 ease-in-out">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            StudyAI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link
            href="#features"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            How it works
          </Link>
          <Link
            href="#pricing"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LoginForm></LoginForm>
          <RegisterForm></RegisterForm>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
