
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getShortcutDisplay } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsProps {
  shortcuts: Array<{
    key: string;
    description: string;
    action: () => void;
    modifier?: "ctrl" | "alt" | "shift" | "meta";
  }>;
  isEnabled: boolean;
  onToggle: () => void;
}

const KeyboardShortcuts = ({ 
  shortcuts,
  isEnabled,
  onToggle
}: KeyboardShortcutsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Keyboard Shortcuts"
          className="h-9 w-9"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use keyboard shortcuts to quickly generate and manage passwords
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 my-4">
          <Switch id="shortcuts-enabled" checked={isEnabled} onCheckedChange={onToggle} />
          <Label htmlFor="shortcuts-enabled">Enable keyboard shortcuts</Label>
        </div>
        
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="bg-muted px-4 py-2 rounded-t-md">
              <h3 className="text-sm font-medium">Available Shortcuts</h3>
            </div>
            <div className="p-4 space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs bg-muted border rounded-md font-mono">
                    {getShortcutDisplay(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts;
