import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "../components/ThemeProvider";
import NextAuthProvider from "@/components/providers/NextAuthProviders";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import NavbarWrapper from "@/components/NavbarWrapper";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

const inter = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: "StudyAI - AI-Powered Study Assistant",
    template: "%s | StudyAI",
  },
  description:
    "Make your study smarter and easier with an AI assistant. Summaries, flashcards, study plans, and much more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextAuthProvider>
      {" "}
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          "h-full",
          "antialiased",
          inter.variable,
          playfair.variable
        )}>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
           (function() {
             try {
               var theme = localStorage.getItem('theme');
               if (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                 theme = 'dark';
               }
               if (theme === 'dark') {
                 document.documentElement.classList.add('dark');
               }
             } catch (e) {}
           })();
         `,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col">
          <ThemeProvider>
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toasterId="default"
              toastOptions={{
                // Define default options
                className: "text-sm font-medium",
                duration: 5000,
                removeDelay: 1000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },

                // Default options for specific types
                success: {
                  style: {
                    background: "#8A8AFF",
                  },
                  duration: 3000,
                  iconTheme: {
                    primary: "#2E2EFF",
                    secondary: "white",
                  },
                },
                error: {
                  style: {
                    background: "#FF5C5C",
                  },
                  duration: 3000,
                  iconTheme: {
                    primary: "red",
                    secondary: "white",
                  },
                },
              }}
            />
            <NavbarWrapper />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </NextAuthProvider>
  );
}
