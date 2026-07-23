"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { img: 28, text: "text-lg" },
  md: { img: 36, text: "text-xl" },
  lg: { img: 48, text: "text-2xl" },
};

type LogoProps = {
  size?: keyof typeof sizeMap;
  showText?: boolean;
  className?: string;
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const { img, text } = sizeMap[size];

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="CodeU Academy — Home"
    >
      <div
        className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ width: img, height: img }}
      >
        <Image
          src="/logo.jpg"
          alt="CodeU"
          width={img}
          height={img}
          className="object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const fallback = target.nextElementSibling;
            if (fallback) {
              (fallback as HTMLElement).style.display = "flex";
            }
          }}
        />
        <span
          className="hidden items-center justify-center font-mono font-bold text-brand-600"
          style={{ fontSize: img * 0.5 }}
        >
          &lt;CODEU/&gt;
        </span>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", text)}>
          <span className="text-foreground">Code</span>
          <span className="text-brand-600">U</span>
        </span>
      )}
    </Link>
  );
}
