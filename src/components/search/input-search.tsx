"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/lib/useIsMobile";
import { cn } from "@/lib/utils";

export interface IInputSearchProps {
  /** 검색 실행 시 호출되는 콜백 함수 */
  onSearch?: (value: string) => void;
  /** 초기 검색어 */
  defaultValue?: string;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 왼쪽에 표시할 로고 또는 아이콘 */
  leftLogo?: React.ReactNode;
  /** 검색어 변경 시 호출되는 콜백 함수 */
  onChange?: (value: string) => void;
  /** 추가 클래스명 */
  className?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

export const InputSearch = ({
  onSearch,
  defaultValue = "",
  placeholder = "검색어를 입력하세요",
  leftLogo,
  onChange,
  className,
  disabled = false,
}: IInputSearchProps) => {
  const [value, setValue] = useState(defaultValue);
  const isMobile = useIsMobile();

  const handleClear = useCallback(() => {
    setValue("");
    onChange?.( "");
  }, [onChange]);

  const handleSearch = useCallback(() => {
    if (value.trim() && onSearch) {
      onSearch(value.trim());
    }
  }, [value, onSearch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        {/* Left Logo */}
        {leftLogo && (
          <div className="absolute left-3 z-10 flex items-center">
            {leftLogo}
          </div>
        )}

        {/* Input */}
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          variant="default"
          inputSize={isMobile ? "lg" : "xl"}
          className={cn(
            "w-full bg-white pr-20",
            leftLogo && "pl-12",
            !leftLogo && "pl-4",
            "text-slate-600 rounded-lg border border-[#E5E7EB] focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
          )}
        />

        {/* Right Icons Container */}
        <div className="absolute right-2 flex items-center gap-1">
          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className={cn(
                "flex items-center justify-center rounded-full p-1.5 transition-colors",
                "text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]",
                "focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-1",
                disabled && "cursor-not-allowed opacity-50"
              )}
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={disabled || !value.trim()}
            className={cn(
              "flex items-center justify-center rounded-full p-1.5 transition-colors",
              "text-slate-600 hover:bg-slate-600/10",
              "focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-1",
              (!value.trim() || disabled) &&
                "cursor-not-allowed opacity-50 hover:bg-transparent"
            )}
            aria-label="검색하기"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};