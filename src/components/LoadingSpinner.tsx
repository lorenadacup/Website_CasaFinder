import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8"
};

const variantClasses = {
  default: "text-stone-600 dark:text-stone-400",
  primary: "text-indigo-600 dark:text-indigo-400",
  secondary: "text-stone-600 dark:text-stone-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400"
};

export default function LoadingSpinner({
  size = "md",
  variant = "primary",
  text,
  fullScreen = false,
  className = ""
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin`} />
      {text && (
        <p className={`mt-2 text-${size} text-stone-600 dark:text-stone-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Skeleton loading components
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-md border border-stone-200 dark:border-stone-700 animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full h-48 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-3/4" />
            <div className="h-6 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 dark:from-amber-900 dark:via-amber-800 dark:to-amber-900 rounded w-1/2" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-full" />
                  <div className="h-3 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-2/3" />
                </div>
              ))}
            </div>
            <div className="h-9 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-[400px] bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded-2xl animate-pulse" />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded"
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((colIndex) => (
            <div
              key={colIndex}
              className="h-6 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading overlay for API calls
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute -inset-4 bg-indigo-500/10 rounded-full animate-ping" />
        <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
      <p className="mt-4 text-stone-700 dark:text-stone-300 font-medium">{message}</p>
      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
        Please wait while we process your request...
      </p>
    </div>
  );
}