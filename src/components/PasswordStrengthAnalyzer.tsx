import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityIcon, CheckIcon, XIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PasswordStrengthAnalyzerProps {
  password: string;
}

const PasswordStrengthAnalyzer: React.FC<PasswordStrengthAnalyzerProps> = ({ password }) => {
  const isMobile = useIsMobile();
  
  const getPasswordStrength = () => {
    if (!password) return "weak";
    
    const length = password.length;
    let typesCount = 0;
    
    if (/[a-z]/.test(password)) typesCount++;
    if (/[A-Z]/.test(password)) typesCount++;
    if (/[0-9]/.test(password)) typesCount++;
    if (/[^a-zA-Z0-9]/.test(password)) typesCount++;
    
    if (length < 8) return "weak";
    if (length < 12) return typesCount >= 3 ? "moderate" : "weak";
    if (length < 16) return typesCount >= 3 ? "strong" : "moderate";
    return typesCount >= 3 ? "very-strong" : "strong";
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    switch (strength) {
      case "weak": return "bg-red-500";
      case "moderate": return "bg-amber-500";
      case "strong": return "bg-green-500";
      case "very-strong": return "bg-green-600";
      default: return "bg-gray-300";
    }
  };

  const getPasswordScore = () => {
    const strength = getPasswordStrength();
    switch (strength) {
      case "weak": return 25;
      case "moderate": return 50;
      case "strong": return 75;
      case "very-strong": return 100;
      default: return 0;
    }
  };

  const hasMinLength = password.length >= 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasNoRepeatingChars = !/(.)\1\1/.test(password);
  const hasNoCommonPatterns = !/^(?:123456|password|qwerty)/i.test(password);
  
  const getTimeToCrack = () => {
    if (!password) return "Instantly";
    
    const charsetSize = 
      (hasLowercase ? 26 : 0) + 
      (hasUppercase ? 26 : 0) + 
      (hasNumber ? 10 : 0) + 
      (hasSymbol ? 33 : 0);
    
    const combinations = Math.pow(charsetSize, password.length);
    const attemptsPerSecond = 1000000000;
    const seconds = combinations / attemptsPerSecond;
    
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 315360000) return `${Math.round(seconds / 31536000)} years`;
    
    return "Centuries";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`h-9 ${isMobile ? "w-9 p-0" : ""}`}>
          <ActivityIcon className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
          {!isMobile && "Analyze Strength"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Password Strength Analysis
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Check how secure your password is
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {password ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Strength</span>
                  <span className="text-sm font-medium capitalize">
                    {getPasswordStrength().replace("-", " ")}
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all ${getPasswordStrengthColor()}`}
                    style={{ width: `${getPasswordScore()}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-2">
                  Estimated time to crack: <span className="font-medium">{getTimeToCrack()}</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Password Criteria</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    {hasMinLength ? (
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm">At least 12 characters</span>
                  </div>
                  <div className="flex items-center">
                    {hasLowercase ? (
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm">Contains lowercase letters</span>
                  </div>
                  <div className="flex items-center">
                    {hasUppercase ? (
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm">Contains uppercase letters</span>
                  </div>
                  <div className="flex items-center">
                    {hasNumber ? (
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm">Contains numbers</span>
                  </div>
                  <div className="flex items-center">
                    {hasSymbol ? (
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm">Contains symbols</span>
                  </div>
                  <div className="flex items-center">
                    {hasNoRepeatingChars ? (
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm">No repeating characters</span>
                  </div>
                  <div className="flex items-center">
                    {hasNoCommonPatterns ? (
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm">No common patterns</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>
                  This analysis is an estimate. The actual strength of your password depends on many factors including whether it contains personal information or common words.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p>Generate a password first to analyze its strength</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordStrengthAnalyzer;
