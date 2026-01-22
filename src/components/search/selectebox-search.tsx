"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ISelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ISelecteboxSearchProps {
  /** 선택 옵션 리스트 */
  options: ISelectOption[];
  /** 선택된 값 변경 시 호출되는 콜백 함수 */
  onChange?: (value: string | number | null) => void;
  /** 초기 선택값 */
  defaultValue?: string | number | null;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 전체 선택 해제 가능 여부 */
  clearable?: boolean;
}

export const SelecteboxSearch = ({
  options,
  onChange,
  defaultValue = null,
  placeholder = "선택하세요",
  className,
  disabled = false,
  clearable = false,
}: ISelecteboxSearchProps) => {
  const [value, setValue] = useState<string | number | null>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // 외부에서 defaultValue가 변경되면 내부 상태 업데이트
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = useCallback(
    (optionValue: string | number) => {
      if (disabled) return;
      setValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    },
    [disabled, onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      setValue(null);
      onChange?.(null);
    },
    [disabled, onChange]
  );

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  return (
    <div className={cn("relative w-full", className)} ref={selectRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "relative flex w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-white",
          "h-12 px-4 py-3 text-base",
          "text-slate-600 transition-colors",
          "focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-600",
          "hover:border-[#9CA3AF]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[#E5E7EB]",
          // 모바일 스타일
          "max-[767px]:h-11 max-[767px]:py-2 max-[767px]:text-sm",
          isOpen && "border-slate-600 ring-1 ring-slate-600"
        )}
        aria-label="선택박스 열기"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span
          className={cn(
            "flex-1 text-left truncate",
            !selectedOption && "text-[#9CA3AF]"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Chevron Icon */}
          <ChevronDown
            className={cn(
              "h-5 w-5 text-[#9CA3AF] transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-lg"
          role="listbox"
        >
          <div className="max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#6B7280]">
                옵션이 없습니다
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                const isDisabled = option.disabled || false;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !isDisabled && handleSelect(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm transition-colors",
                      "hover:bg-[#F9FAFB]",
                      isSelected && "bg-[#EFF6FF] text-[#155DFC] font-medium",
                      isDisabled &&
                        "cursor-not-allowed opacity-50 hover:bg-transparent",
                      // 모바일 스타일
                      "max-[767px]:py-2 max-[767px]:text-xs"
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
