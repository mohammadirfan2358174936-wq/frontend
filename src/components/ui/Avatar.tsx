import { useState, type HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  src?: string;
  name?: string;
  alt?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

const statusStyles: Record<AvatarStatus, string> = {
  online: "bg-emerald-glow",
  offline: "bg-white/40",
  busy: "bg-rose-glow",
  away: "bg-amber-glow",
};

function toInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function Avatar({
  src,
  name,
  alt,
  size = "md",
  status,
  className,
  ...rest
}: AvatarProps) {
  const [broken, setBroken] = useState(false);
  const showImage = src && !broken;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 rounded-full bg-gradient-to-br from-brand-500 via-violet-glow to-fuchsia-glow p-[2px]",
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-eventora-900">
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name ?? ""}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden className="font-display font-semibold text-white">
            {toInitials(name)}
          </span>
        )}
      </span>

      {status && (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-eventora-950",
            statusStyles[status],
          )}
        />
      )}
    </span>
  );
}
