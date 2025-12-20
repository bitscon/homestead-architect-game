import * as React from "react";
import { Search, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  onSearch?: (value: string) => void;
  statusOptions?: FilterOption[];
  typeOptions?: FilterOption[];
  onStatusChange?: (value: string) => void;
  onTypeChange?: (value: string) => void;
  onViewChange?: (value: "grid" | "list") => void;
  showViewToggle?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  (
    {
      onSearch,
      statusOptions,
      typeOptions,
      onStatusChange,
      onTypeChange,
      onViewChange,
      showViewToggle = false,
      searchPlaceholder = "Search...",
      className,
    },
    ref
  ) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      onSearch?.(value);
    };

    const handleViewToggle = (mode: "grid" | "list") => {
      setViewMode(mode);
      onViewChange?.(mode);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          className
        )}
      >
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          {statusOptions && statusOptions.length > 0 && (
            <Select onValueChange={onStatusChange} defaultValue={statusOptions[0]?.value}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Type Filter */}
          {typeOptions && typeOptions.length > 0 && (
            <Select onValueChange={onTypeChange} defaultValue={typeOptions[0]?.value}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* View Toggle */}
        {showViewToggle && (
          <div className="flex items-center gap-1 rounded-md border border-input bg-background p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleViewToggle("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleViewToggle("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);

FilterBar.displayName = "FilterBar";
