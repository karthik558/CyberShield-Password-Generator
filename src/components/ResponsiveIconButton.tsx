
import React from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveIconButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

const ResponsiveIconButton: React.FC<ResponsiveIconButtonProps> = ({
  icon,
  text,
  className,
  ...props
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Button
      className={cn(
        "transition-all",
        isMobile ? "w-9 h-9 p-0" : "h-9",
        className
      )}
      {...props}
    >
      {icon}
      {!isMobile && <span className="ml-2">{text}</span>}
    </Button>
  );
};

export default ResponsiveIconButton;
