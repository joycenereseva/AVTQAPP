import Image from "next/image";
import {
  APP_DISPLAY_NAME,
  APP_TAGLINE,
  BRAND_AVATAR_URL,
  CREF_LABEL,
  INSTRUCTOR_NAME,
} from "@/lib/branding";
import { cn } from "@/lib/utils";

type Variant = "header" | "headerLight" | "login" | "report";

type Props = {
  variant?: Variant;
  className?: string;
  showSubtitle?: boolean;
};

export function BrandMark({ variant = "header", className, showSubtitle = true }: Props) {
  const isHeader = variant === "header" || variant === "headerLight";
  const onDark = variant === "header";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full",
          isHeader ? "h-9 w-9 ring-2 ring-white/20" : "h-14 w-14 ring-2 ring-[var(--teal-dark)]/20",
        )}
      >
        <Image
          src={BRAND_AVATAR_URL}
          alt=""
          width={56}
          height={56}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-brand font-bold leading-tight tracking-wide",
            onDark && "text-base text-white",
            variant === "login" && "text-lg text-white",
            variant === "report" && "text-base text-[var(--text)]",
          )}
        >
          {variant === "login" || isHeader
            ? APP_DISPLAY_NAME
            : variant === "report"
              ? INSTRUCTOR_NAME
              : INSTRUCTOR_NAME}
        </p>
        {showSubtitle && (
          <p
            className={cn(
              "text-[11px]",
              onDark && "text-[var(--teal-light)]",
              variant === "login" && "text-white/80",
              variant === "report" &&
                "font-brand text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--teal-dark)]",
              !onDark && variant !== "login" && variant !== "report" && "text-[var(--gray-text)]",
            )}
          >
            {variant === "report"
              ? "Natação Particular"
              : variant === "login"
                ? INSTRUCTOR_NAME
                : APP_TAGLINE}
          </p>
        )}
        {variant === "report" && (
          <p className="text-xs text-[var(--gray-text)]">{CREF_LABEL}</p>
        )}
      </div>
    </div>
  );
}
