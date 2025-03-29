import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  FolderIcon, 
  BriefcaseIcon, 
  UserIcon, 
  CreditCardIcon, 
  LockIcon,
  HomeIcon,
  GlobeIcon,
  HeartIcon,
  ServerIcon,
  PlusIcon
} from "lucide-react";

interface PasswordCategoryProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const categories = [
  { id: "social", name: "Social Media", icon: <GlobeIcon className="h-4 w-4" /> },
  { id: "financial", name: "Financial", icon: <CreditCardIcon className="h-4 w-4" /> },
  { id: "work", name: "Work", icon: <BriefcaseIcon className="h-4 w-4" /> },
  { id: "personal", name: "Personal", icon: <UserIcon className="h-4 w-4" /> },
  { id: "home", name: "Home", icon: <HomeIcon className="h-4 w-4" /> },
  { id: "entertainment", name: "Entertainment", icon: <HeartIcon className="h-4 w-4" /> },
  { id: "servers", name: "Servers", icon: <ServerIcon className="h-4 w-4" /> },
  { id: "secure", name: "Secure", icon: <LockIcon className="h-4 w-4" /> },
];

const PasswordCategories: React.FC<PasswordCategoryProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const handleCustomCategory = () => {
    if (customCategory.trim()) {
      onSelectCategory(customCategory.trim());
      setCustomCategory("");
      setIsCustomOpen(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <FolderIcon className="h-4 w-4 mr-2" />
          {selectedCategory 
            ? categories.find(c => c.id === selectedCategory)?.name || selectedCategory
            : "Category"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="grid grid-cols-2 gap-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              className="justify-start h-9 px-2"
              onClick={() => onSelectCategory(category.id)}
            >
              <span className="mr-2">{category.icon}</span>
              <span className="text-xs">{category.name}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="justify-start h-9 px-2 col-span-2"
            onClick={() => setIsCustomOpen(!isCustomOpen)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <span className="text-xs">Custom Category</span>
          </Button>
          {isCustomOpen && (
            <div className="col-span-2 flex gap-1 mt-1">
              <Input
                type="text"
                placeholder="Enter category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="h-9 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomCategory()}
              />
              <Button
                size="sm"
                className="h-9"
                onClick={handleCustomCategory}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PasswordCategories;
