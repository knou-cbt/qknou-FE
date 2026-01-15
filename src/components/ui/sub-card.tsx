import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ============================================
// SubCard Component
// ============================================

const subCardVariants = cva(
  "box-border flex flex-col items-start p-[1px] bg-white border border-[#E5E7EB] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-[14px] overflow-hidden",
  {
    variants: {
      size: {
        default: "w-[394.66px] h-[254px]",
        sm: "w-[300px] h-[220px]",
        lg: "w-[480px] h-[300px]",
        full: "w-full h-auto min-h-[254px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface ISubCardStatItem {
  label: string
  value: string | number
  valueColor?: "default" | "success" | "warning" | "danger"
}

export interface ISubCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof subCardVariants> {
  title?: string
  stats?: ISubCardStatItem[]
  progress?: number
  buttonText?: string
  buttonIcon?: React.ReactNode
  onButtonClick?: () => void
}

const SubCard = React.forwardRef<HTMLDivElement, ISubCardProps>(
  (
    {
      className,
      size,
      title,
      stats = [],
      progress = 0,
      buttonText,
      buttonIcon,
      onButtonClick,
      children,
      ...props
    },
    ref
  ) => {
    const getValueColor = (color?: ISubCardStatItem["valueColor"]) => {
      switch (color) {
        case "success":
          return "text-[#00A63E]"
        case "warning":
          return "text-[#F59E0B]"
        case "danger":
          return "text-[#EF4444]"
        default:
          return "text-[#101828]"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(subCardVariants({ size, className }))}
        {...props}
      >
        {/* Top Gradient Bar */}
        <div className="w-full h-2 bg-gradient-to-r from-[#2B7FFF] to-[#155DFC] flex-none" />

        {/* Content Container */}
        <div className="relative flex-1 w-full">
          {/* Title */}
          {title && (
            <div className="absolute left-6 top-6">
              <span className="font-normal text-base leading-6 text-[#101828]">
                {title}
              </span>
            </div>
          )}

          {/* Stats Section */}
          {stats.length > 0 && (
            <div className="absolute left-6 top-16 flex flex-col gap-3">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center w-[344.66px]"
                >
                  <span className="font-normal text-sm leading-5 text-[#4A5565]">
                    {stat.label}
                  </span>
                  <span
                    className={cn(
                      "font-normal text-base leading-6",
                      getValueColor(stat.valueColor)
                    )}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="absolute left-6 top-[140px] w-[344.66px] h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2B7FFF] to-[#155DFC] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          )}

          {/* Action Button */}
          {buttonText && (
            <button
              onClick={onButtonClick}
              className="absolute left-6 top-[172px] w-[344.66px] h-10 flex flex-row justify-center items-center gap-2 bg-[#F9FAFB] border border-[#D1D5DC] rounded-[10px] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <span className="font-normal text-base leading-6 text-[#364153]">
                {buttonText}
              </span>
              {buttonIcon || (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.33334 8H12.6667"
                    stroke="#364153"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 3.33334L12.6667 8L8 12.6667"
                    stroke="#364153"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Custom Content */}
          {children}
        </div>
      </div>
    )
  }
)
SubCard.displayName = "SubCard"

// SubCard sub-components for flexible composition
const SubCardGradientBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full h-2 bg-gradient-to-r from-[#2B7FFF] to-[#155DFC] flex-none",
      className
    )}
    {...props}
  />
))
SubCardGradientBar.displayName = "SubCardGradientBar"

const SubCardTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("font-normal text-base leading-6 text-[#101828]", className)}
    {...props}
  />
))
SubCardTitle.displayName = "SubCardTitle"

const SubCardStatLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("font-normal text-sm leading-5 text-[#4A5565]", className)}
    {...props}
  />
))
SubCardStatLabel.displayName = "SubCardStatLabel"

const SubCardStatValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "success" | "warning" | "danger"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const colorMap = {
    default: "text-[#101828]",
    success: "text-[#00A63E]",
    warning: "text-[#F59E0B]",
    danger: "text-[#EF4444]",
  }

  return (
    <span
      ref={ref}
      className={cn(
        "font-normal text-base leading-6",
        colorMap[variant],
        className
      )}
      {...props}
    />
  )
})
SubCardStatValue.displayName = "SubCardStatValue"

export interface ISubCardProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const SubCardProgressBar = React.forwardRef<
  HTMLDivElement,
  ISubCardProgressBarProps
>(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden",
      className
    )}
    {...props}
  >
    <div
      className="h-full bg-gradient-to-r from-[#2B7FFF] to-[#155DFC] rounded-full transition-all duration-300"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
))
SubCardProgressBar.displayName = "SubCardProgressBar"

const SubCardButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode
  }
>(({ className, children, icon, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "w-full h-10 flex flex-row justify-center items-center gap-2 bg-[#F9FAFB] border border-[#D1D5DC] rounded-[10px] hover:bg-[#F3F4F6] transition-colors cursor-pointer",
      className
    )}
    {...props}
  >
    <span className="font-normal text-base leading-6 text-[#364153]">
      {children}
    </span>
    {icon || (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.33334 8H12.6667"
          stroke="#364153"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 3.33334L12.6667 8L8 12.6667"
          stroke="#364153"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
))
SubCardButton.displayName = "SubCardButton"

export {
  SubCard,
  SubCardGradientBar,
  SubCardTitle,
  SubCardStatLabel,
  SubCardStatValue,
  SubCardProgressBar,
  SubCardButton,
  subCardVariants,
}

