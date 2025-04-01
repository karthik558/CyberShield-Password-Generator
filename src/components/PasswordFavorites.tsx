
import React from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCopy, 
  BookmarkCheck, 
  Trash2, 
  Eye, 
  EyeOff,
  X,
  CheckIcon,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface PasswordFavoritesProps {
  favorites: Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>;
  onClearFavorites: () => void;
  onCopyPassword: (password: string) => void;
  onRemoveFromFavorites: (index: number) => void;
}

const PasswordFavorites: React.FC<PasswordFavoritesProps> = ({
  favorites,
  onClearFavorites,
  onCopyPassword,
  onRemoveFromFavorites
}) => {
  const [showPasswords, setShowPasswords] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const isMobile = useIsMobile();

  const handleCopy = (password: string, index: number) => {
    onCopyPassword(password);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak": return "bg-red-500";
      case "moderate": return "bg-amber-500";
      case "strong": return "bg-green-500";
      case "very-strong": return "bg-green-600";
      default: return "bg-gray-300";
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative w-9 h-9 p-0">
          <BookmarkCheck className="h-4 w-4" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto bg-background text-foreground">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex justify-between items-center">
            Favorite Passwords
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
                className="h-8 px-2"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {favorites.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onClearFavorites}
                  className="h-8 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-muted-foreground text-sm">No favorite passwords yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((item, index) => (
              <div
                key={index}
                className="p-3 border rounded-md bg-secondary/20 relative group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs opacity-70">
                    {item.timestamp.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.category && item.category !== "uncategorized" && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {item.category}
                      </span>
                    )}
                    <span className="text-xs capitalize bg-secondary px-2 py-0.5 rounded-full">
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="font-mono bg-secondary/30 rounded p-2 mb-2 overflow-x-auto">
                  {showPasswords ? (
                    <code className="text-xs">{item.password}</code>
                  ) : (
                    <code className="text-xs">••••••••••••••••</code>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor(item.strength)}`}
                        style={{
                          width:
                            item.strength === "weak"
                              ? "25%"
                              : item.strength === "moderate"
                              ? "50%"
                              : item.strength === "strong"
                              ? "75%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                    <span className="text-xs capitalize">{item.strength.replace("-", " ")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(item.password, index)}
                      className="h-7 px-2"
                    >
                      {copiedIndex === index ? (
                        <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <ClipboardCopy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFromFavorites(index)}
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PasswordFavorites;
