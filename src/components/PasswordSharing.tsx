
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Share2, Copy, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface PasswordSharingProps {
  password: string;
  strength: "weak" | "moderate" | "strong" | "very-strong";
}

const PasswordSharing: React.FC<PasswordSharingProps> = ({ password, strength }) => {
  const [includePassword, setIncludePassword] = useState(true);
  const [includeStrength, setIncludeStrength] = useState(true);
  const [expirationHours, setExpirationHours] = useState(24);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  
  const generateShareLink = () => {
    if (!password) {
      toast.error("Generate a password first!");
      return;
    }
    
    // In a real app, this would create a secure link on a backend
    // Here we'll create a mock link with encoded data in the fragment
    const data = {
      p: includePassword ? password : undefined,
      s: includeStrength ? strength : undefined,
      e: new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString(),
    };
    
    const encodedData = btoa(JSON.stringify(data));
    const link = `${window.location.origin}/shared#${encodedData}`;
    
    setShareLink(link);
    toast.success("Share link generated!");
  };
  
  const copyShareLink = () => {
    if (!shareLink) {
      generateShareLink();
      setTimeout(() => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
      }, 100);
    } else {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Share2 className="h-4 w-4 mr-2" />
          Share Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Password Securely
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            Generate a secure link to share your password with someone. The link will expire after the specified time.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-password" className="text-sm cursor-pointer">
                Include password in share
              </Label>
              <Switch
                id="include-password"
                checked={includePassword}
                onCheckedChange={setIncludePassword}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-strength" className="text-sm cursor-pointer">
                Include strength analysis
              </Label>
              <Switch
                id="include-strength"
                checked={includeStrength}
                onCheckedChange={setIncludeStrength}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiration" className="text-sm">
                Link expires after (hours)
              </Label>
              <Input
                id="expiration"
                type="number"
                min="1"
                max="720"
                value={expirationHours}
                onChange={(e) => setExpirationHours(parseInt(e.target.value) || 24)}
              />
            </div>
            
            {shareLink && (
              <div className="space-y-2">
                <Label htmlFor="share-link" className="text-sm">
                  Share Link
                </Label>
                <div className="flex gap-2">
                  <Textarea
                    id="share-link"
                    readOnly
                    value={shareLink}
                    className="font-mono text-xs h-20"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={copyShareLink}
                    className="h-20"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link will expire on {new Date(Date.now() + expirationHours * 60 * 60 * 1000).toLocaleString()}
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button onClick={generateShareLink}>
                Generate Share Link
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Note: In a real application, the sharing would be handled via a secure server. This is a demo implementation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordSharing;
