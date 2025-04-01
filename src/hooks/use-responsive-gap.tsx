
import { useIsMobile } from "./use-mobile";

export function useResponsiveGap() {
  const isMobile = useIsMobile();
  
  return {
    gap: isMobile ? "gap-1" : "gap-2",
    iconSize: isMobile ? "h-4 w-4" : "h-4 w-4 mr-2"
  };
}
