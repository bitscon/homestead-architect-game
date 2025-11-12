import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "blue" | "amber" | "green" | "neutral";
  description?: string;
  className?: string;
  href?: string;
}

const toneStyles = {
  blue: "border-l-4 border-l-blue-500",
  amber: "border-l-4 border-l-amber-500",
  green: "border-l-4 border-l-green-500",
  neutral: "border-l-4 border-l-primary",
};

const toneIconColors = {
  blue: "text-blue-500",
  amber: "text-amber-500",
  green: "text-green-500",
  neutral: "text-primary",
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, icon: Icon, tone = "neutral", description, className, href }, ref) => {
    const content = (
      <>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className={cn("h-4 w-4", toneIconColors[tone])} />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
      </>
    );

    if (href) {
      return (
        <Link to={href} className="block">
          <Card ref={ref} className={cn(toneStyles[tone], "cursor-pointer transition-transform hover:scale-105", className)}>
            {content}
          </Card>
        </Link>
      );
    }

    return (
      <Card ref={ref} className={cn(toneStyles[tone], className)}>
        {content}
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";
