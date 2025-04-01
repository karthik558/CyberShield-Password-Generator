import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckIcon, 
  ClipboardCopy, 
  Eye, 
  EyeOff, 
  RefreshCw,
  ChevronDown,
  Info,
  ShieldCheck,
  Heart,
  Pin
} from "lucide-react";
import { toast } from "sonner";
import { convertToLeetSpeak, createMixedPassword } from "@/utils/leetSpeakConverter";
import { generatePronounceablePassword } from "@/utils/pronounceableGenerator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import PasswordHistory from "./PasswordHistory";
import PasswordFavorites from "./PasswordFavorites";
import PasswordCategories from "./PasswordCategories";
import PasswordStrengthAnalyzer from "./PasswordStrengthAnalyzer";
import PasswordExportImport from "./PasswordExportImport";
import PasswordQRCode from "./PasswordQRCode";
import PasswordExpiryTimer from "./PasswordExpiryTimer";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResponsiveGap } from "@/hooks/use-responsive-gap";

interface PasswordSettings {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  requireAllTypes: boolean;
  avoidRepeating: boolean;
  usePronounceable: boolean;
}

interface PinSettings {
  length: number;
  avoidRepeating: boolean;
}

const PasswordGenerator = () => {
  const [settings, setSettings] = useState<PasswordSettings>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
    requireAllTypes: true,
    avoidRepeating: false,
    usePronounceable: false,
  });

  const [pinSettings, setPinSettings] = useState<PinSettings>({
    length: 6,
    avoidRepeating: false,
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [securityTipsOpen, setSecurityTipsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "moderate" | "strong" | "very-strong">("strong");
  
  const [baseText, setBaseText] = useState("");
  const [leetPassword, setLeetPassword] = useState("");
  const [activeTab, setActiveTab] = useState("random");
  const [pin, setPin] = useState("");
  const { gap } = useResponsiveGap();
  const isMobile = useIsMobile();

  const [passwordHistory, setPasswordHistory] = useState<Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>>([]);

  const [passwordFavorites, setPasswordFavorites] = useState<Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>>([]);

  const [selectedCategory, setSelectedCategory] = useState("");

  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()-_=+";
  const ambiguousChars = "iIl1Lo0O";

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return "weak";
    
    const length = pwd.length;
    let typesCount = 0;
    
    if (/[a-z]/.test(pwd)) typesCount++;
    if (/[A-Z]/.test(pwd)) typesCount++;
    if (/[0-9]/.test(pwd)) typesCount++;
    if (/[^a-zA-Z0-9]/.test(pwd)) typesCount++;
    
    if (length < 8) return "weak";
    if (length < 12) return typesCount >= 3 ? "moderate" : "weak";
    if (length < 16) return typesCount >= 3 ? "strong" : "moderate";
    return typesCount >= 3 ? "very-strong" : "strong";
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak": return "bg-red-500";
      case "moderate": return "bg-amber-500";
      case "strong": return "bg-green-500";
      case "very-strong": return "bg-green-600";
      default: return "bg-gray-300";
    }
  };

  const generateRandomPassword = () => {
    try {
      if (settings.usePronounceable) {
        const pronounceablePassword = generatePronounceablePassword(
          settings.length,
          settings.includeUppercase,
          settings.includeNumbers,
          settings.includeSymbols
        );
        
        setPassword(pronounceablePassword);
        const strength = calculatePasswordStrength(pronounceablePassword);
        setPasswordStrength(strength);
        
        toast.success("Pronounceable password generated successfully!");
        return;
      }
      
      if (
        !settings.includeLowercase &&
        !settings.includeUppercase &&
        !settings.includeNumbers &&
        !settings.includeSymbols
      ) {
        toast.error("Please select at least one character type");
        return;
      }

      let availableChars = "";
      const mustIncludeChars = [];

      if (settings.includeLowercase) {
        availableChars += lowercaseChars;
        mustIncludeChars.push(lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)));
      }

      if (settings.includeUppercase) {
        availableChars += uppercaseChars;
        mustIncludeChars.push(uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)));
      }

      if (settings.includeNumbers) {
        availableChars += numberChars;
        mustIncludeChars.push(numberChars.charAt(Math.floor(Math.random() * numberChars.length)));
      }

      if (settings.includeSymbols) {
        availableChars += symbolChars;
        mustIncludeChars.push(symbolChars.charAt(Math.floor(Math.random() * symbolChars.length)));
      }

      if (settings.excludeAmbiguous) {
        for (const char of ambiguousChars) {
          availableChars = availableChars.replace(char, "");
        }
      }

      let result = "";
      const length = settings.length;

      if (settings.requireAllTypes && mustIncludeChars.length > 0) {
        result = mustIncludeChars.join("");
        
        for (let i = result.length; i < length; i++) {
          const nextChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
          
          if (settings.avoidRepeating && result.includes(nextChar)) {
            let attemptCount = 0;
            let uniqueChar = nextChar;
            
            while (result.includes(uniqueChar) && attemptCount < 10) {
              uniqueChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
              attemptCount++;
            }
            
            result += uniqueChar;
          } else {
            result += nextChar;
          }
        }
        
        result = result.split("").sort(() => 0.5 - Math.random()).join("");
      } else {
        for (let i = 0; i < length; i++) {
          const nextChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
          
          if (settings.avoidRepeating && result.includes(nextChar)) {
            let attemptCount = 0;
            let uniqueChar = nextChar;
            
            while (result.includes(uniqueChar) && attemptCount < 10) {
              uniqueChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
              attemptCount++;
            }
            
            result += uniqueChar;
          } else {
            result += nextChar;
          }
        }
      }

      setPassword(result);
      const strength = calculatePasswordStrength(result);
      setPasswordStrength(strength);
      
      toast.success("Password generated successfully!");
    } catch (error) {
      console.error("Password generation error:", error);
      toast.error("Failed to generate password");
    }
  };

  const generateLeetPassword = () => {
    if (!baseText) {
      toast.error("Please enter some text first");
      return;
    }
    
    const mixedPassword = createMixedPassword(
      baseText,
      settings.length,
      settings.includeLowercase,
      settings.includeUppercase,
      settings.includeNumbers,
      settings.includeSymbols,
      settings.excludeAmbiguous
    );
    
    setLeetPassword(mixedPassword);
    const strength = calculatePasswordStrength(mixedPassword);
    setPasswordStrength(strength);
    
    toast.success("Password created successfully!");
  };

  const generatePin = () => {
    try {
      const length = pinSettings.length;
      let result = "";
      
      for (let i = 0; i < length; i++) {
        const nextDigit = Math.floor(Math.random() * 10).toString();
        
        if (pinSettings.avoidRepeating && result.includes(nextDigit)) {
          let attemptCount = 0;
          let uniqueDigit = nextDigit;
          
          while (result.includes(uniqueDigit) && attemptCount < 10) {
            uniqueDigit = Math.floor(Math.random() * 10).toString();
            attemptCount++;
          }
          
          result += uniqueDigit;
        } else {
          result += nextDigit;
        }
      }
      
      setPin(result);
      setPasswordStrength(length < 6 ? "weak" : length < 8 ? "moderate" : "strong");
      toast.success("PIN generated successfully!");
    } catch (error) {
      console.error("PIN generation error:", error);
      toast.error("Failed to generate PIN");
    }
  };

  const copyToClipboard = () => {
    let textToCopy = activeTab === "random" ? password : 
                    activeTab === "leet" ? leetPassword : pin;
    
    if (!textToCopy) {
      toast.error("Generate a password first!");
      return;
    }
    
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopied(true);
        toast.success("Password copied to clipboard!");
        
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      () => {
        toast.error("Failed to copy password");
      }
    );
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    toast.success("Password history cleared");
  };

  const clearFavorites = () => {
    setPasswordFavorites([]);
    toast.success("Favorites cleared");
  };

  const addToFavorites = (passwordItem: {
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }) => {
    if (passwordFavorites.some(item => item.password === passwordItem.password)) {
      toast.info("Password already in favorites");
      return;
    }

    setPasswordFavorites(prev => [
      {
        ...passwordItem,
        category: passwordItem.category || selectedCategory || "uncategorized"
      },
      ...prev
    ]);
    
    toast.success("Added to favorites");
  };

  const removeFromFavorites = (index: number) => {
    setPasswordFavorites(prev => prev.filter((_, i) => i !== index));
    toast.success("Removed from favorites");
  };

  const handleImportPasswords = (importedPasswords: Array<any>) => {
    const existingPasswords = new Set(passwordHistory.map(p => p.password));
    const newPasswords = importedPasswords.filter(p => !existingPasswords.has(p.password));
    
    setPasswordHistory(prev => [
      ...newPasswords,
      ...prev
    ].slice(0, 100));
  };

  const addCurrentPasswordToFavorites = () => {
    const currentPassword = activeTab === "random" ? password : 
                           activeTab === "leet" ? leetPassword : pin;
    
    if (!currentPassword) {
      toast.error("Generate a password first!");
      return;
    }

    addToFavorites({
      password: currentPassword,
      timestamp: new Date(),
      strength: passwordStrength,
      type: activeTab as "random" | "leet" | "pin",
      category: selectedCategory || "uncategorized"
    });
  };

  const saveToHistory = () => {
    const currentPassword = activeTab === "random" ? password : 
                           activeTab === "leet" ? leetPassword : pin;
    
    if (!currentPassword) {
      toast.error("Generate a password first!");
      return;
    }

    setPasswordHistory(prev => [
      {
        password: currentPassword,
        timestamp: new Date(),
        strength: passwordStrength,
        type: activeTab as "random" | "leet" | "pin",
        category: selectedCategory || "uncategorized"
      },
      ...prev.slice(0, 19)
    ]);
    
    toast.success("Added to history");
  };

  const handlePasswordExpiry = () => {
    if (activeTab === "random") {
      setPassword("");
    } else if (activeTab === "leet") {
      setLeetPassword("");
    } else {
      setPin("");
    }
  };

  const shortcuts = [
    {
      key: "g",
      description: "Generate new password/PIN",
      action: () => {
        if (activeTab === "random") {
          generateRandomPassword();
        } else if (activeTab === "leet") {
          generateLeetPassword();
        } else {
          generatePin();
        }
      }
    },
    {
      key: "c",
      description: "Copy to clipboard",
      action: copyToClipboard
    },
    {
      key: "s",
      description: "Toggle visibility",
      action: () => setShowPassword(!showPassword)
    },
    {
      key: "f",
      description: "Add to favorites",
      action: addCurrentPasswordToFavorites
    },
    {
      key: "h",
      description: "Save to history",
      action: saveToHistory
    },
    {
      key: "1",
      description: "Switch to Random tab",
      action: () => setActiveTab("random")
    },
    {
      key: "2",
      description: "Switch to Text to Password tab",
      action: () => setActiveTab("leet")
    },
    {
      key: "3",
      description: "Switch to PIN Generator tab",
      action: () => setActiveTab("pin")
    }
  ];

  const { isListening, toggleListening } = useKeyboardShortcuts(shortcuts);

  useEffect(() => {
    // Empty useEffect to avoid automatic password generation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPassword = activeTab === "random" ? password : 
                         activeTab === "leet" ? leetPassword : pin;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-lg backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-1 border-b pb-3 pt-4">
          <CardTitle className="text-2xl font-medium tracking-tight text-center relative flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
            Generate Secure Password
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Create a strong, unique password to protect your accounts
          </p>
        </CardHeader>
        
        <CardContent className="space-y-5 pt-5">
          <Tabs 
            defaultValue="random" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-3 mb-5">
              <TabsTrigger value="random" className="text-sm">Random Password</TabsTrigger>
              <TabsTrigger value="leet" className="text-sm">Text to Password</TabsTrigger>
              <TabsTrigger value="pin" className="text-sm">PIN Generator</TabsTrigger>
            </TabsList>
            
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex ${gap}`}>
                  <PasswordHistory 
                    history={passwordHistory}
                    onClearHistory={clearHistory}
                    onCopyPassword={(pwd) => {
                      navigator.clipboard.writeText(pwd).then(
                        () => toast.success("Password copied to clipboard!"),
                        () => toast.error("Failed to copy password")
                      );
                    }}
                    onAddToFavorites={addToFavorites}
                    favorites={passwordFavorites}
                  />
                  <PasswordFavorites
                    favorites={passwordFavorites}
                    onClearFavorites={clearFavorites}
                    onCopyPassword={(pwd) => {
                      navigator.clipboard.writeText(pwd).then(
                        () => toast.success("Password copied to clipboard!"),
                        () => toast.error("Failed to copy password")
                      );
                    }}
                    onRemoveFromFavorites={removeFromFavorites}
                  />
                  <PasswordStrengthAnalyzer password={currentPassword} />
                </div>
                <div className={`flex ${gap}`}>
                  {!isMobile && (
                    <KeyboardShortcuts 
                      shortcuts={shortcuts}
                      isEnabled={isListening}
                      onToggle={toggleListening}
                    />
                  )}
                  <PasswordExportImport 
                    passwordHistory={passwordHistory}
                    onImport={handleImportPasswords}
                  />
                </div>
              </div>
              
              {activeTab === "random" ? (
                <div className="relative bg-secondary/30 border rounded-md p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder={password ? "" : "Click 'Generate' to create a password"}
                      readOnly
                      className="text-lg font-mono border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3 placeholder:font-sans placeholder:text-base"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex-shrink-0 h-8 w-8"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      className="flex-shrink-0 h-8 w-8"
                    >
                      {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className={`flex ${gap}`}>
                      <PasswordCategories 
                        onSelectCategory={setSelectedCategory}
                        selectedCategory={selectedCategory}
                      />
                      <PasswordQRCode password={password} />
                      <PasswordExpiryTimer 
                        password={password}
                        onPasswordExpiry={handlePasswordExpiry} 
                      />
                    </div>
                    <div className={`flex ${gap}`}>
                      <Button
                        variant="outline"
                        onClick={addCurrentPasswordToFavorites}
                        className={`${isMobile ? "w-9 h-9 p-0" : "h-9"}`}
                        size="sm"
                      >
                        <Heart className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                        {!isMobile && "Save"}
                      </Button>
                      <Button
                        onClick={generateRandomPassword}
                        className={`${isMobile ? "w-9 h-9 p-0" : "h-9"}`}
                        size="sm"
                      >
                        <RefreshCw className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                        {!isMobile && "Generate"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : activeTab === "leet" ? (
                <div className="space-y-4 mb-4">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor="base-text" className="text-xs font-medium mb-1.5 block">Enter text to convert</Label>
                      <Input
                        id="base-text"
                        placeholder="Enter a word or phrase"
                        value={baseText}
                        onChange={(e) => setBaseText(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <Button
                      onClick={generateLeetPassword}
                      className={`${isMobile ? "w-10 h-10 p-0" : "h-10"}`}
                    >
                      <RefreshCw className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                      {!isMobile && "Generate"}
                    </Button>
                  </div>
                  
                  {leetPassword && (
                    <div className="relative bg-secondary/30 border rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          id="leet-password"
                          type={showPassword ? "text" : "password"}
                          value={leetPassword}
                          readOnly
                          className="text-lg font-mono border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="flex-shrink-0 h-8 w-8"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyToClipboard}
                          className="flex-shrink-0 h-8 w-8"
                        >
                          {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className={`flex ${gap}`}>
                          <PasswordCategories 
                            onSelectCategory={setSelectedCategory}
                            selectedCategory={selectedCategory}
                          />
                          <PasswordQRCode password={leetPassword} />
                          <PasswordExpiryTimer 
                            password={leetPassword}
                            onPasswordExpiry={handlePasswordExpiry} 
                          />
                        </div>
                        <div className={`flex ${gap}`}>
                          <Button
                            variant="outline"
                            onClick={addCurrentPasswordToFavorites}
                            className={`${isMobile ? "w-9 h-9 p-0" : "h-9"}`}
                            size="sm"
                          >
                            <Heart className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                            {!isMobile && "Save"}
                          </Button>
                          <Button
                            onClick={generateLeetPassword}
                            className={`${isMobile ? "w-9 h-9 p-0" : "h-9"}`}
                            size="sm"
                          >
                            <RefreshCw className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                            {!isMobile && "Regenerate"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  <div className="relative bg-secondary/30 border rounded-md p-3">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-full flex items-center justify-center">
                        {pin ? (
                          <div className="flex flex-wrap justify-center gap-1 max-w-full overflow-hidden">
                            {pin.split('').map((digit, index) => (
                              <div
                                key={index}
                                className="h-12 w-10 flex items-center justify-center relative"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-md border border-primary/20 shadow-sm" />
                                <div className="absolute inset-0 backdrop-blur-sm rounded-md" />
                                <span className="relative text-xl font-semibold z-10">
                                  {showPassword ? digit : '•'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-3 px-2">
                            <p className="text-muted-foreground text-center text-sm">
                              Generate a PIN to see it displayed here
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 w-full">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={copyToClipboard}
                          className="flex-shrink-0 h-8 w-8"
                        >
                          {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                        </Button>
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={pin}
                          placeholder="Click 'Generate' to create a PIN"
                          readOnly
                          className="text-lg font-mono border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3 placeholder:font-sans placeholder:text-base"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="flex-shrink-0 h-8 w-8"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className={`flex ${gap}`}>
                        <PasswordCategories 
                          onSelectCategory={setSelectedCategory}
                          selectedCategory={selectedCategory}
                        />
                        <PasswordQRCode password={pin} />
                        <PasswordExpiryTimer 
                          password={pin}
                          onPasswordExpiry={handlePasswordExpiry} 
                        />
                      </div>
                      <div className={`flex ${gap}`}>
                        <Button
                          variant="outline"
                          onClick={addCurrentPasswordToFavorites}
                          className={`${isMobile ? "w-9 h-9 p-0" : "h-9"}`}
                          size="sm"
                        >
                          <Heart className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                          {!isMobile && "Save"}
                        </Button>
                        <Button
                          onClick={generatePin}
                          className={`${isMobile ? "w-9 h-9 p-0" : "h-9"}`}
                          size="sm"
                        >
                          <RefreshCw className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                          {!isMobile && "Generate"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-xs font-medium">Password Strength</span>
                  <span className="capitalize text-xs font-medium">{passwordStrength.replace("-", " ")}</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getPasswordStrengthColor()}`}
                    style={{ 
                      width: passwordStrength === "weak" ? "25%" : 
                             passwordStrength === "moderate" ? "50%" : 
                             passwordStrength === "strong" ? "75%" : "100%" 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <TabsContent value="random" className="space-y-4 mt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password-length" className="text-xs font-medium">Password Length</Label>
                  <span className="font-mono text-xs">{settings.length}</span>
                </div>
                <Slider
                  id="password-length"
                  min={8}
                  max={128}
                  step={1}
                  value={[settings.length]}
                  onValueChange={(value) => setSettings({ ...settings, length: value[0] })}
                  className="py-2"
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Character Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="lowercase" className="text-xs">Lowercase (a-z)</Label>
                    <Switch
                      id="lowercase"
                      checked={settings.includeLowercase}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeLowercase: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="uppercase" className="text-xs">Uppercase (A-Z)</Label>
                    <Switch
                      id="uppercase"
                      checked={settings.includeUppercase}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeUppercase: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="numbers" className="text-xs">Numbers (0-9)</Label>
                    <Switch
                      id="numbers"
                      checked={settings.includeNumbers}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeNumbers: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="symbols" className="text-xs">Symbols (!@#$%^&*)</Label>
                    <Switch
                      id="symbols"
                      checked={settings.includeSymbols}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeSymbols: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="ambiguous" className="text-xs">Exclude Ambiguous (iIl1Lo0O)</Label>
                    <Switch
                      id="ambiguous"
                      checked={settings.excludeAmbiguous}
                      onCheckedChange={(checked) => setSettings({ ...settings, excludeAmbiguous: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="pronounceable" className="text-xs">Pronounceable Password</Label>
                    <Switch
                      id="pronounceable"
                      checked={settings.usePronounceable}
                      onCheckedChange={(checked) => setSettings({ ...settings, usePronounceable: checked })}
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Advanced Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="all-types" className="text-xs">Require All Selected Types</Label>
                    <Switch
                      id="all-types"
                      checked={settings.requireAllTypes}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireAllTypes: checked })}
                      disabled={settings.usePronounceable}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="avoid-repeating" className="text-xs">Avoid Repeating Characters</Label>
                    <Switch
                      id="avoid-repeating"
                      checked={settings.avoidRepeating}
                      onCheckedChange={(checked) => setSettings({ ...settings, avoidRepeating: checked })}
                      disabled={settings.usePronounceable}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="leet" className="space-y-4 mt-0">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Enter a memorable word or phrase that will be converted to a secure password. 
                  We'll mix it with random characters to reach your desired length.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="leet-password-length" className="text-xs font-medium">Password Length</Label>
                    <span className="font-mono text-xs">{settings.length}</span>
                  </div>
                  <Slider
                    id="leet-password-length"
                    min={8}
                    max={128}
                    step={1}
                    value={[settings.length]}
                    onValueChange={(value) => setSettings({ ...settings, length: value[0] })}
                    className="py-2"
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Character Types (for random part)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-lowercase" className="text-xs">Lowercase (a-z)</Label>
                      <Switch
                        id="leet-lowercase"
                        checked={settings.includeLowercase}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeLowercase: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-uppercase" className="text-xs">Uppercase (A-Z)</Label>
                      <Switch
                        id="leet-uppercase"
                        checked={settings.includeUppercase}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeUppercase: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-numbers" className="text-xs">Numbers (0-9)</Label>
                      <Switch
                        id="leet-numbers"
                        checked={settings.includeNumbers}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeNumbers: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-symbols" className="text-xs">Symbols (!@#$%^&*)</Label>
                      <Switch
                        id="leet-symbols"
                        checked={settings.includeSymbols}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeSymbols: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-ambiguous" className="text-xs">Exclude Ambiguous (iIl1Lo0O)</Label>
                      <Switch
                        id="leet-ambiguous"
                        checked={settings.excludeAmbiguous}
                        onCheckedChange={(checked) => setSettings({ ...settings, excludeAmbiguous: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pin" className="space-y-4 mt-0">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Generate a secure PIN code with your desired length. Great for device unlock codes, ATM PINs, and other numeric access needs.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="pin-length" className="text-xs font-medium">PIN Length</Label>
                    <span className="font-mono text-xs">{pinSettings.length}</span>
                  </div>
                  <Slider
                    id="pin-length"
                    min={4}
                    max={12}
                    step={1}
                    value={[pinSettings.length]}
                    onValueChange={(value) => setPinSettings({ ...pinSettings, length: value[0] })}
                    className="py-2"
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">PIN Options</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="avoid-repeating-pin" className="text-xs">Avoid Repeating Digits</Label>
                      <Switch
                        id="avoid-repeating-pin"
                        checked={pinSettings.avoidRepeating}
                        onCheckedChange={(checked) => setPinSettings({ ...pinSettings, avoidRepeating: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <Collapsible
            open={securityTipsOpen}
            onOpenChange={setSecurityTipsOpen}
            className="space-y-2 bg-secondary/20 backdrop-blur-sm rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-sm">Password Security Tips</h3>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                  <span className="sr-only">Toggle</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${securityTipsOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2 pt-2">
              <ul className="list-disc list-inside pl-4 text-xs space-y-2 text-muted-foreground">
                <li>Use at least 12 characters for strong security</li>
                <li>Combine uppercase, lowercase, numbers, and symbols</li>
                <li>Avoid using personal information</li>
                <li>Use unique passwords for each account</li>
                <li>Consider using a password manager</li>
                <li>Pronounceable passwords can be easier to remember but may be less secure</li>
                <li>Use keyboard shortcuts to quickly generate passwords</li>
                <li>Set expiry timers for temporary passwords</li>
                <li>For PINs, avoid common sequences like 1234 or 0000</li>
                <li>Longer PINs (8+ digits) provide much better security</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;
