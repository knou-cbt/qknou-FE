import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

// ============================================
// ExamNavButton Variants
// ============================================

const examNavButtonVariants = cva(
    "box-border flex flex-row justify-center items-center gap-2 h-12 rounded-lg font-normal text-base leading-6 text-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                prev: "bg-white border-2 border-[var(--border)] text-[var(--secondary)] hover:bg-[var(--muted)] disabled:hover:bg-white",
                answer: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[#1F2937] disabled:hover:bg-[var(--secondary)]",
                next: "bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] disabled:hover:bg-[var(--brand)]",
            },
            size: {
                default: "flex-1",
                fixed: "w-[290px]",
            },
        },
        defaultVariants: {
            variant: "next",
            size: "default",
        },
    }
)

// ============================================
// ExamNavButton Component
// ============================================

export interface IExamNavButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof examNavButtonVariants> {
    showLeftIcon?: boolean
    showRightIcon?: boolean
}

const ExamNavButton = React.forwardRef<HTMLButtonElement, IExamNavButtonProps>(
    (
        {
            className,
            variant,
            size,
            showLeftIcon = false,
            showRightIcon = false,
            children,
            ...props
        },
        ref
    ) => {
        const iconColor = variant === "prev" ? "#364153" : "#FFFFFF"

        return (
            <button
                ref={ref}
                className={cn(examNavButtonVariants({ variant, size, className }))}
                {...props}
            >
                {showLeftIcon && (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12.5 15L7.5 10L12.5 5"
                            stroke={iconColor}
                            strokeWidth="1.67"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
                <span>{children}</span>
                {showRightIcon && (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M7.5 15L12.5 10L7.5 5"
                            stroke={iconColor}
                            strokeWidth="1.67"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>
        )
    }
)
ExamNavButton.displayName = "ExamNavButton"

// ============================================
// ExamNavButtons Container Component
// ============================================

export interface IExamNavButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
    onPrevClick?: () => void
    onAnswerClick?: () => void
    onNextClick?: () => void
    prevLabel?: string
    answerLabel?: string
    nextLabel?: string
    showPrev?: boolean
    showAnswer?: boolean
    showNext?: boolean
    prevDisabled?: boolean
    answerDisabled?: boolean
    nextDisabled?: boolean
}

const ExamNavButtons = React.forwardRef<HTMLDivElement, IExamNavButtonsProps>(
    (
        {
            className,
            onPrevClick,
            onAnswerClick,
            onNextClick,
            prevLabel = "이전",
            answerLabel = "정답 보기",
            nextLabel = "다음",
            showPrev = true,
            showAnswer = true,
            showNext = true,
            prevDisabled = false,
            answerDisabled = false,
            nextDisabled = false,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-row items-center gap-3 w-full max-w-[896px]",
                    className
                )}
                {...props}
            >
                {showPrev && (
                    <ExamNavButton
                        variant="prev"
                        showLeftIcon
                        onClick={onPrevClick}
                        disabled={prevDisabled}
                    >
                        {prevLabel}
                    </ExamNavButton>
                )}
                {showAnswer && (
                    <ExamNavButton
                        variant="answer"
                        onClick={onAnswerClick}
                        disabled={answerDisabled}
                    >
                        {answerLabel}
                    </ExamNavButton>
                )}
                {showNext && (
                    <ExamNavButton
                        variant="next"
                        showRightIcon
                        onClick={onNextClick}
                        disabled={nextDisabled}
                    >
                        {nextLabel}
                    </ExamNavButton>
                )}
            </div>
        )
    }
)
ExamNavButtons.displayName = "ExamNavButtons"

export { ExamNavButton, ExamNavButtons, examNavButtonVariants }
