"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

export interface IHeaderProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "exam";
}

const Header = React.forwardRef<HTMLElement, IHeaderProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const isExamMode = variant === "exam";

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 border-b border-[#E5E7EB] bg-white",
          isExamMode && "bg-blue-50",
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:h-16">
          <Link href="/" className="transition-opacity">
            <Image
              src="/logo.png"
              alt="문제다모아 로고"
              width={30}
              height={30}
              className="h-12 w-12 object-contain"
            />
          </Link>

          {isExamMode && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 md:text-sm">
                시험 모드
              </span>
            </div>
          )}
        </div>
      </header>
    );
  }
);
Header.displayName = "Header";

export { Header };
