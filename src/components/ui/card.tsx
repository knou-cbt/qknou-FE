import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "relative box-border bg-white border border-[#E5E7EB] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-[14px]",
  {
    variants: {
      size: {
        default: "w-[394.66px] h-[202px]",
        sm: "w-[300px] h-[160px]",
        lg: "w-[480px] h-[240px]",
        full: "w-full h-auto min-h-[202px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const iconContainerVariants = cva(
  "flex items-center justify-center rounded-[10px]",
  {
    variants: {
      variant: {
        default: "bg-[#EFF6FF]",
        success: "bg-[#ECFDF5]",
        warning: "bg-[#FFFBEB]",
        danger: "bg-[#FEF2F2]",
      },
      size: {
        default: "w-12 h-12",
        sm: "w-10 h-10",
        lg: "w-14 h-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ICardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  icon?: React.ReactNode
  iconVariant?: VariantProps<typeof iconContainerVariants>["variant"]
  label?: string
  title?: string
  subtitle?: string
}

const Card = React.forwardRef<HTMLDivElement, ICardProps>(
  (
    {
      className,
      size,
      icon,
      iconVariant = "default",
      label,
      title,
      subtitle,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ size, className }))}
        {...props}
      >
        {/* Icon Container */}
        {icon && (
          <div className="absolute left-[25px] top-[25px]">
            <div className={cn(iconContainerVariants({ variant: iconVariant }))}>
              <div className="w-6 h-6 flex items-center justify-center text-[#155DFC]">
                {icon}
              </div>
            </div>
          </div>
        )}

        {/* Label */}
        {label && (
          <div className="absolute left-[25px] top-[89px]">
            <span className="font-normal text-sm leading-5 text-[#4A5565]">
              {label}
            </span>
          </div>
        )}

        {/* Title */}
        {title && (
          <div className="absolute left-[25px] top-[117px]">
            <span className="font-normal text-[30px] leading-9 text-[#101828]">
              {title}
            </span>
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <div className="absolute left-[25px] top-[157px]">
            <span className="font-normal text-sm leading-5 text-[#6A7282]">
              {subtitle}
            </span>
          </div>
        )}

        {/* Custom Content */}
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

// Sub-components for flexible composition
const CardIconContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof iconContainerVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(iconContainerVariants({ variant, size, className }))}
    {...props}
  >
    <div className="w-6 h-6 flex items-center justify-center text-[#155DFC]">
      {children}
    </div>
  </div>
))
CardIconContainer.displayName = "CardIconContainer"

const CardLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("font-normal text-sm leading-5 text-[#4A5565]", className)}
    {...props}
  />
))
CardLabel.displayName = "CardLabel"

const CardTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "font-normal text-[30px] leading-9 text-[#101828]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardSubtitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("font-normal text-sm leading-5 text-[#6A7282]", className)}
    {...props}
  />
))
CardSubtitle.displayName = "CardSubtitle"

export {
  Card,
  CardIconContainer,
  CardLabel,
  CardTitle,
  CardSubtitle,
  cardVariants,
  iconContainerVariants,
}
