
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import PasswordGenerator from "@/components/PasswordGenerator";
import Preloader from "@/components/Preloader";

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    // Initialize the isDark state based on document class on first render
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const handleThemeChange = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <Preloader />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <header className="border-b border-border sticky top-0 backdrop-blur-sm bg-background/80 z-10">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img 
                src={isDark ? "/favicon.png" : "/favicon-dark.png"} 
                alt="CyberShield Logo" 
                className="w-6 h-6" 
              />
              <h1 className="text-2xl font-bold tracking-tight">
                CyberShield
              </h1>
              <span className="ml-2 text-xs bg-secondary rounded-full px-2.5 py-1 font-medium">
                Password Generator
              </span>
            </div>
            <ThemeToggle onThemeChange={handleThemeChange} />
          </div>
        </header>

        <main className="container mx-auto py-8 px-4">
          <PasswordGenerator />
        </main>

        <footer className="py-6 border-t border-border mt-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © 2025 CyberShield. Designed & Developed by{" "}
              <a 
                href="https://karthiklal.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium transition-colors hover:text-primary"
              >
                KARTHIK LAL
              </a>
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
