import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

// ============================================
// Tag Components
// ============================================

const tagVariants = cva(
  "inline-flex items-center justify-center px-3 h-7 rounded-full font-normal text-sm leading-5",
  {
    variants: {
      variant: {
        primary: "bg-[#EFF6FF] text-[#1447E6]",
        secondary: "bg-[#F3F4F6] text-[#364153]",
        success: "bg-[#ECFDF5] text-[#059669]",
        warning: "bg-[#FFFBEB] text-[#D97706]",
        danger: "bg-[#FEF2F2] text-[#DC2626]",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

export interface IQuestionTagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

const QuestionTag = React.forwardRef<HTMLSpanElement, IQuestionTagProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(tagVariants({ variant, className }))}
      {...props}
    />
  )
);
QuestionTag.displayName = "QuestionTag";

// ============================================
// Answer Choice Components
// ============================================

const answerChoiceVariants = cva(
  "box-border flex flex-row items-start px-4 py-3 gap-4 w-full min-h-[60px] bg-white border-2 rounded-[14px] cursor-pointer transition-all duration-200",
  {
    variants: {
      state: {
        default: "border-[#E5E7EB] hover:border-[#D1D5DC]",
        selected: "border-[#155DFC] bg-[#EFF6FF]",
        correct: "border-[#059669] bg-[#ECFDF5]",
        incorrect: "border-[#DC2626] bg-[#FEF2F2]",
        disabled: "border-[#E5E7EB] opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

const radioVariants = cva(
  "box-border flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200",
  {
    variants: {
      state: {
        default: "bg-white border-[#D1D5DC]",
        selected: "bg-white border-[#155DFC]",
        correct: "bg-white border-[#059669]",
        incorrect: "bg-white border-[#DC2626]",
        disabled: "bg-white border-[#D1D5DC]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface IAnswerChoiceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  state?: "default" | "selected" | "correct" | "incorrect" | "disabled";
  value: string | number;
  onValueSelect?: (value: string | number) => void;
}

const AnswerChoice = React.forwardRef<HTMLDivElement, IAnswerChoiceProps>(
  (
    { className, state = "default", value, onValueSelect, children, ...props },
    ref
  ) => {
    const handleClick = () => {
      if (state !== "disabled" && onValueSelect) {
        onValueSelect(value);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(answerChoiceVariants({ state, className }))}
        onClick={handleClick}
        role="radio"
        aria-checked={state === "selected"}
        tabIndex={state === "disabled" ? -1 : 0}
        {...props}
      >
        {/* Correct Checkmark or Radio Circle */}
        {state === "correct" ? (
          <div className="flex items-center justify-center w-6 h-6 bg-[#059669] rounded-full shrink-0 mt-0.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7L5.5 9.5L11 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className={cn(radioVariants({ state }), "shrink-0 mt-0.5")}>
            {(state === "selected" || state === "incorrect") && (
              <div
                className={cn("w-2.5 h-2.5 rounded-full", {
                  "bg-[#155DFC]": state === "selected",
                  "bg-[#DC2626]": state === "incorrect",
                })}
              />
            )}
          </div>
        )}

        {/* Answer Text */}
        <span className="flex-1 min-w-0 font-normal text-sm sm:text-base leading-5 sm:leading-6 text-[#101828] break-words">
          {children}
        </span>
      </div>
    );
  }
);
AnswerChoice.displayName = "AnswerChoice";

// ============================================
// Action Button Component
// ============================================

const actionButtonVariants = cva(
  "w-full h-11 sm:h-12 flex items-center justify-center rounded-[14px] font-normal text-sm sm:text-base leading-5 sm:leading-6 transition-all duration-200 cursor-pointer break-words px-4",
  {
    variants: {
      variant: {
        default: "bg-[#155DFC] text-white hover:bg-[#1447E6]",
        disabled: "bg-[#D1D5DC] text-[#6A7282] cursor-not-allowed",
        success: "bg-[#059669] text-white hover:bg-[#047857]",
        danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
        outline:
          "bg-white border-2 border-[#E5E7EB] text-[#364153] hover:bg-[#F9FAFB]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface IQuestionActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {}

const QuestionActionButton = React.forwardRef<
  HTMLButtonElement,
  IQuestionActionButtonProps
>(({ className, variant, disabled, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      actionButtonVariants({
        variant: disabled ? "disabled" : variant,
        className,
      })
    )}
    disabled={disabled}
    {...props}
  />
));
QuestionActionButton.displayName = "QuestionActionButton";

// ============================================
// Question Card Component
// ============================================

const questionCardVariants = cva(
  "flex flex-col items-start bg-white rounded-[16px] w-full",
  {
    variants: {
      size: {
        default: "max-w-[1066px] pt-6 sm:pt-8 pb-0 gap-4 sm:gap-6",
        sm: "w-full max-w-[600px] pt-4 sm:pt-6 pb-0 gap-3 sm:gap-4",
        lg: "w-full max-w-[1200px] pt-6 sm:pt-10 pb-0 gap-4 sm:gap-6",
        full: "w-full pt-6 sm:pt-8 pb-0 gap-4 sm:gap-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface IQuestionTag {
  label: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export interface IAnswerOption {
  value: string | number;
  label: string;
}

export interface IQuestionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questionCardVariants> {
  tags?: IQuestionTag[];
  question?: string;
  example?: string | null;
  answers?: IAnswerOption[];
  selectedAnswer?: string | number | null;
  correctAnswer?: (string | number)[]; // 복수 정답 지원 (배열)
  showResult?: boolean;
  onAnswerSelect?: (value: string | number) => void;
  actionButtonText?: string;
  actionButtonDisabled?: boolean;
  onActionClick?: () => void;
}

const QuestionCard = React.forwardRef<HTMLDivElement, IQuestionCardProps>(
  (
    {
      className,
      size,
      tags = [],
      question,
      example,
      answers = [],
      selectedAnswer,
      correctAnswer = [],
      showResult = false,
      onAnswerSelect,
      actionButtonText = "정답 확인",
      actionButtonDisabled = false,
      onActionClick,
      children,
      ...props
    },
    ref
  ) => {
    const getAnswerState = (
      value: string | number
    ): "default" | "selected" | "correct" | "incorrect" => {
      if (showResult) {
        // 복수 정답 지원: 배열에 포함되어 있으면 정답
        const isCorrect = correctAnswer.includes(value);
        if (isCorrect) return "correct";
        if (value === selectedAnswer && !isCorrect) return "incorrect";
      }
      if (value === selectedAnswer) return "selected";
      return "default";
    };

    return (
      <div className="flex flex-col items-start gap-4 sm:gap-6 w-full ">
        {/* Question Card Section */}
        <div
          ref={ref}
          className={cn(questionCardVariants({ size, className }))}
          {...props}
        >
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-row flex-wrap items-start gap-2 w-full px-4 sm:px-0">
              {tags.map((tag, index) => (
                <QuestionTag key={index} variant={tag.variant}>
                  {tag.label}
                </QuestionTag>
              ))}
            </div>
          )}

          {/* Question Text */}
          {question && (
            <p className="font-normal text-base sm:text-[19px] leading-6 sm:leading-[31px] text-[#101828] w-full wrap-break-word">
              {question}
            </p>
          )}

          {/* Example (보기) */}
          {example && (
            <div className="w-full mt-4 px-4 sm:px-0">
              <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px]">
                <p className="text-xs font-medium text-[#6B7280] mb-2">보기</p>
                <p className="font-normal text-sm sm:text-base leading-6 text-[#364153] break-words">
                  {example}
                </p>
              </div>
            </div>
          )}

          {/* Custom Content */}
          {children}
        </div>

        {/* Answer Choices */}
        {answers.length > 0 && (
          <div className="flex flex-col items-start gap-2 sm:gap-3 w-full">
            {answers.map((answer) => (
              <AnswerChoice
                key={answer.value}
                value={answer.value}
                state={getAnswerState(answer.value)}
                onValueSelect={onAnswerSelect}
              >
                {answer.label}
              </AnswerChoice>
            ))}
          </div>
        )}

        {/* Action Button */}
        {actionButtonText && (
          <QuestionActionButton
            disabled={actionButtonDisabled}
            onClick={onActionClick}
          >
            {actionButtonText}
          </QuestionActionButton>
        )}
      </div>
    );
  }
);
QuestionCard.displayName = "QuestionCard";

// ============================================
// Question Container Component
// ============================================

export type IQuestionContainerProps = React.HTMLAttributes<HTMLDivElement>

const QuestionContainer = React.forwardRef<
  HTMLDivElement,
  IQuestionContainerProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col items-start px-4 sm:px-6 pt-6 sm:pt-8 pb-0 gap-4 sm:gap-6 w-full max-w-[896px]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
QuestionContainer.displayName = "QuestionContainer";

export {
  QuestionTag,
  AnswerChoice,
  QuestionActionButton,
  QuestionCard,
  QuestionContainer,
  tagVariants,
  answerChoiceVariants,
  radioVariants,
  actionButtonVariants,
  questionCardVariants,
};
