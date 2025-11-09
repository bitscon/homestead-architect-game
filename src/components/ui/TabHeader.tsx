import * as React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabHeaderProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabHeader = React.forwardRef<HTMLDivElement, TabHeaderProps>(
  ({ tabs, activeTab, onTabChange, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-6 border-b border-border",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors hover:text-foreground",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

TabHeader.displayName = "TabHeader";
