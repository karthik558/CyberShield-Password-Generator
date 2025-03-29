import React, { useEffect, useState } from "react";

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse delay-100"></div>
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse delay-200"></div>
      </div>
    </div>
  );
};

export default Preloader;
