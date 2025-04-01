import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Shield, Clock3 } from "lucide-react";
import { toast } from "sonner";

const TwoFactorGenerator = () => {
  const [code, setCode] = useState("000000");
  const [timeLeft, setTimeLeft] = useState(30);
  const [secretKey, setSecretKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    // Generate a new code initially
    generateNewCode();
    
    // Set a timer to count down
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewCode();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);
  
  const generateNewCode = () => {
    // In a real app, this would use a proper TOTP algorithm with the secret key
    // This is just a simple example that generates a random 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCode(newCode);
  };
  
  const handleCreateKey = () => {
    // In a real app, this would generate a proper secret key for TOTP
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let key = "";
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecretKey(key);
    toast.success("New 2FA key generated");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Shield className="h-4 w-4 mr-2" />
          2FA Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="secret-key">Secret Key</Label>
            <div className="flex gap-2">
              <Input
                id="secret-key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter or generate a secret key"
                className="font-mono"
              />
              <Button onClick={handleCreateKey} type="button" size="sm">
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In a real 2FA app, you would scan a QR code or enter this key
            </p>
          </div>
          
          {secretKey && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Current Code</Label>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3 mr-1" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
                
                <div className="flex justify-center py-4">
                  <InputOTP maxLength={6} value={code} readOnly>
                    <InputOTPGroup>
                      {code.split('').map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-1 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                This is a simplified demonstration. In a real application, the code would be generated using the TOTP algorithm.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorGenerator;
