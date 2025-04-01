
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import PasswordGenerator from "@/components/PasswordGenerator";
import Preloader from "@/components/Preloader";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const isMobile = useIsMobile();
  
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
          <div className="container mx-auto py-2 px-3 sm:py-4 sm:px-4 flex justify-between items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <img 
                src={isDark ? "/favicon.png" : "/favicon-dark.png"} 
                alt="CyberKeyGen Logo" 
                className="w-5 h-5 sm:w-6 sm:h-6" 
              />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                CyberKeyGen
              </h1>
              {!isMobile && (
                <span className="ml-2 text-xs bg-secondary rounded-full px-2.5 py-1 font-medium">
                  Password Generator
                </span>
              )}
            </div>
            <ThemeToggle onThemeChange={handleThemeChange} />
          </div>
        </header>

        <main className="container mx-auto pt-3 pb-6 px-3 sm:py-8 sm:px-4">
          <PasswordGenerator />
        </main>

        <footer className="py-3 sm:py-6 border-t border-border mt-4 sm:mt-8">
          <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
            <p>
              © 2025 CyberKeyGen. {!isMobile && "Designed & Developed by "}
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
