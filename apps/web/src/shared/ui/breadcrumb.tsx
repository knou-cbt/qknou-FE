"use client";

import * as React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface IBreadcrumbProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 과목명 */
  subject?: string;
  /** 연도 */
  year?: string;
  /** 홈 링크 (기본값: "/") */
  homeHref?: string;
  /** 과목 링크 (기본값: "/exam/{subjectId}/year") */
  subjectHref?: string;
}

const Breadcrumb = React.forwardRef<HTMLDivElement, IBreadcrumbProps>(
  (
    {
      className,
      subject,
      year,
      homeHref = "/",
      subjectHref,
      ...props
    },
    ref
  ) => {
    const items = [
      {
        label: "홈",
        href: homeHref,
        icon: Home,
      },
      ...(subject
        ? [
            {
              label: subject,
              href: subjectHref,
              icon: null,
            },
          ]
        : []),
      ...(year
        ? [
            {
              label: year,
              href: null,
              icon: null,
            },
          ]
        : []),
    ];

    return (
      <nav
        ref={ref}
        className={cn(
          "flex items-center gap-2 text-sm",
          className
        )}
        aria-label="Breadcrumb"
        {...props}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              )}
              {isLast ? (
                <span className="flex items-center gap-1.5 font-medium text-[#101828]">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href || "#"}
                  className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#101828] transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
