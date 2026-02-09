"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => {
              if (!readonly) {
                onChange(star);
              }
            }}
            className={cn(
              "p-0.5 rounded transition-colors",
              readonly
                ? "cursor-default"
                : "cursor-pointer hover:scale-110 active:scale-95"
            )}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                filled
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
