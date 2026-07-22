"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useSession } from "next-auth/react";
import { AvatarDropdown } from "./Avatar";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function AuthRedirectHandler({
  setAuthMode,
}: {
  setAuthMode: (mode: "login" | "register" | null) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      setAuthMode("login");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("login");
      const cleanUrl =
        pathname + (params.toString() ? `?${params.toString()}` : "");
      router.replace(cleanUrl);
    }
  }, [searchParams, pathname, router, setAuthMode]);

  return null;
}

const Navbar = () => {
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

  return (
    <nav className="border-b border-border bg-white/80 dark:bg-slate-950 backdrop-blur-md sticky top-0 z-50 transition-colors duration-700 ease-in-out">
      <Suspense fallback={null}>
        <AuthRedirectHandler setAuthMode={setAuthMode} />
      </Suspense>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              StudyAI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link
            href="/Summary"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Summary
          </Link>
          <Link
            href="/overview"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Overview
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            How it works
          </Link>
        </div>

        {/* Actions (Theme & Auth) */}
        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />

          {session?.status === "loading" ? (
            <>
              <Button
                variant="ghost"
                className="h-10 w-26 animate-pulse rounded-md border border-input bg-muted/50 dark:bg-muted/20"></Button>

              <div className="h-10 w-28 animate-pulse rounded-md bg-indigo-100 dark:bg-indigo-950/50" />
            </>
          ) : isAuthenticated ? (
            <AvatarDropdown />
          ) : (
            <>
              {/* Login Button */}
              <Button
                variant="outline"
                onClick={() => setAuthMode("login")}
                className="dark:text-white hover:cursor-pointer">
                Login
              </Button>

              {/* Get Started Button */}
              <Button
                onClick={() => setAuthMode("register")}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 hover:cursor-pointer dark:text-white">
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
      {!isAuthenticated && (
        <>
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
        </>
      )}
    </nav>
  );
};

export default Navbar;
