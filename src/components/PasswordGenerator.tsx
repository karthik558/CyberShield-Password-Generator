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
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { convertToLeetSpeak, createMixedPassword } from "@/utils/leetSpeakConverter";

// Import the new components
import PasswordHistory from "./PasswordHistory";
import PasswordCategories from "./PasswordCategories";
import PasswordStrengthAnalyzer from "./PasswordStrengthAnalyzer";
import PasswordExportImport from "./PasswordExportImport";

interface PasswordSettings {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  requireAllTypes: boolean;
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
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [securityTipsOpen, setSecurityTipsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "moderate" | "strong" | "very-strong">("strong");
  
  // For leet speak converter tab
  const [baseText, setBaseText] = useState("");
  const [leetPassword, setLeetPassword] = useState("");
  const [activeTab, setActiveTab] = useState("random");

  // New state for added features
  const [passwordHistory, setPasswordHistory] = useState<Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet";
    category: string;
  }>>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Character sets
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
      // Ensure at least one character type is selected
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

      // Remove ambiguous characters if option is selected
      if (settings.excludeAmbiguous) {
        for (const char of ambiguousChars) {
          availableChars = availableChars.replace(char, "");
        }
      }

      let result = "";
      const length = settings.length;

      // Generate the password
      if (settings.requireAllTypes && mustIncludeChars.length > 0) {
        // First add one character from each required type
        result = mustIncludeChars.join("");
        
        // Then fill the rest randomly
        for (let i = result.length; i < length; i++) {
          const nextChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
          
          // Check if we should avoid repeating characters
          if (settings.avoidRepeating && result.includes(nextChar)) {
            // Try to find a non-repeating character (max 10 attempts to avoid infinite loop)
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
        
        // Shuffle the password to make it more random
        result = result.split("").sort(() => 0.5 - Math.random()).join("");
      } else {
        // Generate completely random password
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
      
      // Add to history
      setPasswordHistory(prev => [
        {
          password: result,
          timestamp: new Date(),
          strength: strength,
          type: "random",
          category: selectedCategory || "uncategorized"
        },
        ...prev.slice(0, 19) // Keep only the 20 most recent passwords
      ]);
      
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
    
    // Use the improved function that mixes leet text with random characters
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
    
    // Add to history
    setPasswordHistory(prev => [
      {
        password: mixedPassword,
        timestamp: new Date(),
        strength: strength,
        type: "leet",
        category: selectedCategory || "uncategorized"
      },
      ...prev.slice(0, 19) // Keep only the 20 most recent passwords
    ]);
    
    toast.success("Password created successfully!");
  };

  const copyToClipboard = () => {
    let textToCopy = activeTab === "random" ? password : leetPassword;
    
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

  const handleImportPasswords = (importedPasswords: Array<any>) => {
    // Merge imported passwords with existing ones, avoiding duplicates
    const existingPasswords = new Set(passwordHistory.map(p => p.password));
    const newPasswords = importedPasswords.filter(p => !existingPasswords.has(p.password));
    
    setPasswordHistory(prev => [
      ...newPasswords,
      ...prev
    ].slice(0, 100)); // Limit to 100 passwords total
  };

  useEffect(() => {
    // Remove the automatic password generation on component mount
    // generateRandomPassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The current password being displayed
  const currentPassword = activeTab === "random" ? password : leetPassword;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-lg backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-1 border-b pb-4">
          <CardTitle className="text-2xl font-medium tracking-tight text-center relative flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
            Generate Secure Password
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Create a strong, unique password to protect your accounts
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <Tabs 
            defaultValue="random" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="random" className="text-sm">Random Password</TabsTrigger>
              <TabsTrigger value="leet" className="text-sm">Text to Password</TabsTrigger>
            </TabsList>
            
            {/* Password Display & Controls - Moved to top */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-3">
                <div className="flex space-x-2">
                  <PasswordHistory 
                    history={passwordHistory}
                    onClearHistory={clearHistory}
                    onCopyPassword={(pwd) => {
                      navigator.clipboard.writeText(pwd).then(
                        () => toast.success("Password copied to clipboard!"),
                        () => toast.error("Failed to copy password")
                      );
                    }}
                  />
                  <PasswordStrengthAnalyzer password={currentPassword} />
                </div>
                <div className="flex space-x-2">
                  <PasswordExportImport 
                    passwordHistory={passwordHistory}
                    onImport={handleImportPasswords}
                  />
                </div>
              </div>
              
              {activeTab === "random" ? (
                <div className="relative bg-secondary/30 border rounded-md p-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder={password ? "" : "Click 'Generate' to create a password"}
                      readOnly
                      className="text-lg font-mono border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 px-3 placeholder:font-sans placeholder:text-base"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex-shrink-0"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      className="flex-shrink-0"
                    >
                      {copied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardCopy className="h-5 w-5" />}
                    </Button>
                  </div>
                  
                  <div className="flex justify-between gap-2 mt-3">
                    <div className="flex gap-2">
                      <PasswordCategories 
                        onSelectCategory={setSelectedCategory}
                        selectedCategory={selectedCategory}
                      />
                    </div>
                    <Button
                      onClick={generateRandomPassword}
                      className="h-9"
                      size="sm"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label htmlFor="base-text" className="text-xs font-medium mb-1.5 block">Enter text to convert</Label>
                      <Input
                        id="base-text"
                        placeholder="Enter a word or phrase"
                        value={baseText}
                        onChange={(e) => setBaseText(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <Button
                      onClick={generateLeetPassword}
                      className="h-12"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate
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
                          className="text-lg font-mono border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 px-3"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="flex-shrink-0"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyToClipboard}
                          className="flex-shrink-0"
                        >
                          {copied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardCopy className="h-5 w-5" />}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between gap-2 mt-3">
                        <div className="flex gap-2">
                          <PasswordCategories 
                            onSelectCategory={setSelectedCategory}
                            selectedCategory={selectedCategory}
                          />
                        </div>
                        <Button
                          onClick={generateLeetPassword}
                          className="h-9"
                          size="sm"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Password Strength Indicator */}
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
              {/* Length Control */}
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
              
              {/* Character Types */}
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
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Advanced Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Advanced Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="all-types" className="text-xs">Require All Selected Types</Label>
                    <Switch
                      id="all-types"
                      checked={settings.requireAllTypes}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireAllTypes: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="avoid-repeating" className="text-xs">Avoid Repeating Characters</Label>
                    <Switch
                      id="avoid-repeating"
                      checked={settings.avoidRepeating}
                      onCheckedChange={(checked) => setSettings({ ...settings, avoidRepeating: checked })}
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
                
                {/* Length Control (same as in random tab) */}
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
                
                {/* Character Types for random part */}
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
          </Tabs>
          
          <Separator />
          
          {/* Security Tips */}
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
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;
