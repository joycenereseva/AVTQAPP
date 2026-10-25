import Image from "next/image";
import { studentInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-12 w-12 text-sm",
  md: "h-16 w-16 text-lg",
  lg: "h-[72px] w-[72px] text-2xl",
};

export function StudentAvatar({ name, photoUrl, size = "md", className }: Props) {
  const dim = sizes[size];
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={`Foto de ${name}`}
        width={size === "lg" ? 72 : size === "md" ? 64 : 48}
        height={size === "lg" ? 72 : size === "md" ? 64 : 48}
        className={cn(
          "rounded-full border-2 border-[var(--teal)] object-cover",
          dim,
          className,
        )}
        unoptimized
      />
    );
  }
  return (
    <div
      className={cn(
        "font-brand flex items-center justify-center rounded-full border-2 border-[var(--teal)] bg-[var(--teal-pale)] font-bold text-[var(--teal-dark)]",
        dim,
        className,
      )}
      aria-hidden
    >
      {studentInitials(name)}
    </div>
  );
}
