import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border bg-transparent text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input shadow-sm hover:border-[#9CA3AF]",
        outline: "border-input bg-background shadow-sm hover:border-[#9CA3AF]",
        filled: "border-transparent bg-[#F3F4F6] hover:bg-[#E5E7EB] focus:bg-background focus:border-input",
        underline: "rounded-none border-0 border-b border-input px-0 hover:border-[#6B7280] focus-visible:ring-0",
        ghost: "border-transparent hover:bg-[#F3F4F6]",
      },
      inputSize: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-11 px-4 py-2",
        xl: "h-12 px-4 py-3 text-base",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-[#10B981] focus-visible:ring-[#10B981]",
        warning: "border-[#F59E0B] focus-visible:ring-[#F59E0B]",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
      state: "default",
    },
  }
)

const inputContainerVariants = cva("relative flex items-center", {
  variants: {
    fullWidth: {
      true: "w-full",
      false: "w-auto",
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
})

export interface IInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  fullWidth?: boolean
  errorMessage?: string
  helperText?: string
  label?: string
  required?: boolean
}

const Input = React.forwardRef<HTMLInputElement, IInputProps>(
  (
    {
      className,
      variant,
      inputSize,
      state,
      type = "text",
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      fullWidth = true,
      errorMessage,
      helperText,
      label,
      required,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId()
    const hasError = state === "error" || !!errorMessage
    const effectiveState = hasError ? "error" : state

    return (
      <div className={cn(inputContainerVariants({ fullWidth }), "flex-col items-start gap-1.5")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none text-[#374151]",
              disabled && "opacity-50"
            )}
          >
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className={cn("relative flex items-center", fullWidth && "w-full")}>
          {/* Left Addon */}
          {leftAddon && (
            <div className="flex h-full items-center rounded-l-md border border-r-0 border-input bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
              {leftAddon}
            </div>
          )}

          {/* Input Wrapper */}
          <div className={cn("relative flex flex-1 items-center", fullWidth && "w-full")}>
            {/* Left Icon */}
            {leftIcon && (
              <div className="pointer-events-none absolute left-3 flex items-center text-[#9CA3AF]">
                {leftIcon}
              </div>
            )}

            <input
              id={inputId}
              type={type}
              ref={ref}
              disabled={disabled}
              className={cn(
                inputVariants({ variant, inputSize, state: effectiveState }),
                leftIcon && "pl-10",
                rightIcon && "pr-10",
                leftAddon && "rounded-l-none",
                rightAddon && "rounded-r-none",
                className
              )}
              {...props}
            />

            {/* Right Icon */}
            {rightIcon && (
              <div className="pointer-events-none absolute right-3 flex items-center text-[#9CA3AF]">
                {rightIcon}
              </div>
            )}
          </div>

          {/* Right Addon */}
          {rightAddon && (
            <div className="flex h-full items-center rounded-r-md border border-l-0 border-input bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
              {rightAddon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}

        {/* Helper Text */}
        {helperText && !errorMessage && (
          <p className="text-xs text-[#6B7280]">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
