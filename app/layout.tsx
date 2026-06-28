import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/ThemeProvider";
import NextAuthProvider from "@/components/providers/NextAuthProviders";
import { Plus_Jakarta_Sans, Playfair_Display, Inter } from "next/font/google";

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
  title: "StudyAI - AI-Powered Study Assistant",
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
            <Navbar></Navbar>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </NextAuthProvider>
  );
}
