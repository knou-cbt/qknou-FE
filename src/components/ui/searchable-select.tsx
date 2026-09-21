"use client";

import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "./select";

export interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

/** 옵션이 많을 때(예: 과목 목록)를 위한 검색 가능한 드롭다운 — 목록 높이를 제한하고 내부 스크롤 처리한다 */
export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "검색",
  disabled,
  className,
}: SearchableSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const raf = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const filteredOptions = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(trimmed)
    );
  }, [options, query]);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-2 text-xs text-[#374151]",
          "focus:outline-none focus:ring-1 focus:ring-[#5D50FF] focus:border-[#5D50FF]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            !selectedLabel && "text-muted-foreground"
          )}
        >
          {selectedLabel ?? placeholder ?? "선택"}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-[#9CA3AF] transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-[#E5E7EB] px-2 py-1.5">
            <Search className="size-3.5 shrink-0 text-[#9CA3AF]" aria-hidden />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-xs text-[#374151] placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-xs text-[#9CA3AF]">
                검색 결과가 없어요.
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    disabled={option.disabled}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50",
                      option.value === value && "bg-[#EFF6FF] text-[#155DFC]"
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
