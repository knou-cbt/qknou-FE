import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

// ============================================
// Question Number Button Component
// ============================================

const questionNumberVariants = cva(
  "box-border flex flex-row justify-center items-center w-9 h-9 border-2 rounded-[8px] font-normal text-sm leading-5 text-center transition-all duration-200 cursor-pointer",
  {
    variants: {
      state: {
        default:
          "bg-white border-[#E5E7EB] text-[#99A1AF] hover:border-[#D1D5DC]",
        current: "bg-[#155DFC] border-[#155DFC] text-white",
        answered: "bg-white border-[#D1D5DC] text-[#364153]",
        skipped: "bg-white border-[#E5E7EB] text-[#99A1AF]",
        correct: "bg-[#ECFDF5] border-[#059669] text-[#059669]",
        incorrect: "bg-[#FEF2F2] border-[#DC2626] text-[#DC2626]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface IQuestionNumberButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">,
    VariantProps<typeof questionNumberVariants> {
  number: number;
  showCheckmark?: boolean;
  onNumberSelect?: (number: number) => void;
}

const QuestionNumberButton = React.forwardRef<
  HTMLButtonElement,
  IQuestionNumberButtonProps
>(
  (
    {
      className,
      state = "default",
      number,
      showCheckmark = false,
      onNumberSelect,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (onNumberSelect) {
        onNumberSelect(number);
      }
    };

    return (
      <button
        ref={ref}
        className={cn(questionNumberVariants({ state, className }))}
        onClick={handleClick}
        {...props}
      >
        {showCheckmark && state === "answered" ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8L6.5 11.5L13 4.5"
              stroke="#00A63E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          number
        )}
      </button>
    );
  }
);
QuestionNumberButton.displayName = "QuestionNumberButton";

// ============================================
// Legend Item Component
// ============================================

const legendIconVariants = cva("w-4 h-4 rounded", {
  variants: {
    type: {
      current: "bg-[#155DFC]",
      answered: "border-2 border-[#D1D5DC] flex items-center justify-center",
      skipped: "border-2 border-[#E5E7EB]",
    },
  },
  defaultVariants: {
    type: "current",
  },
});

export interface ILegendItemProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "current" | "answered" | "skipped";
  label: string;
}

const LegendItem = React.forwardRef<HTMLDivElement, ILegendItemProps>(
  ({ className, type, label, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-row items-center gap-2", className)}
      {...props}
    >
      <div className={cn(legendIconVariants({ type }))}>
        {type === "answered" && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6L4.5 8.5L10 3"
              stroke="#00A63E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="font-normal text-xs leading-5 text-[#4A5565]">
        {label}
      </span>
    </div>
  )
);
LegendItem.displayName = "LegendItem";

// ============================================
// Question Navigator Component
// ============================================

const questionNavigatorVariants = cva(
  "flex flex-col items-start bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-[12px]",
  {
    variants: {
      size: {
        default: "w-[1104px] p-4 pt-4 pb-0 gap-3",
        sm: "w-full max-w-[600px] p-3 pt-3 pb-0 gap-2",
        lg: "w-full max-w-[1200px] p-6 pt-6 pb-0 gap-4",
        full: "w-full p-4 pt-4 pb-0 gap-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export type TQuestionState =
  | "default"
  | "current"
  | "answered"
  | "skipped"
  | "correct"
  | "incorrect";

export interface IQuestionNavigatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questionNavigatorVariants> {
  title?: string;
  totalQuestions?: number;
  currentQuestion?: number;
  questionStates?: Record<number, TQuestionState>;
  showCheckmarks?: boolean;
  showLegend?: boolean;
  onQuestionSelect?: (questionNumber: number) => void;
  legendLabels?: {
    current?: string;
    answered?: string;
    skipped?: string;
  };
}

const QuestionNavigator = React.forwardRef<
  HTMLDivElement,
  IQuestionNavigatorProps
>(
  (
    {
      className,
      size,
      title,
      totalQuestions = 40,
      currentQuestion = 1,
      questionStates = {},
      showCheckmarks = true,
      showLegend = true,
      onQuestionSelect,
      legendLabels = {
        current: "현재 문제",
        answered: "푼 문제",
        skipped: "건너뛴 문제",
      },
      children,
      ...props
    },
    ref
  ) => {
    const getQuestionState = (questionNumber: number): TQuestionState => {
      if (questionNumber === currentQuestion) return "current";
      if (questionStates[questionNumber]) return questionStates[questionNumber];
      return "default";
    };

    const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);

    return (
      <div
        ref={ref}
        className={cn(questionNavigatorVariants({ size, className }))}
        {...props}
      >
        {/* Title */}
        {title && (
          <h3 className="font-medium text-sm leading-5 text-[#101828] w-full">
            {title}
          </h3>
        )}

        {/* Question Numbers Grid */}
        <div className="w-full overflow-x-auto">
          <div className="flex flex-row flex-wrap items-start gap-1.5">
            {questions.map((num) => {
              const state = getQuestionState(num);
              return (
                <QuestionNumberButton
                  key={num}
                  number={num}
                  state={state}
                  showCheckmark={showCheckmarks && state === "answered"}
                  onNumberSelect={onQuestionSelect}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-row items-start gap-4 w-full py-2 border-t border-[#E5E7EB]">
            <LegendItem
              type="current"
              label={legendLabels.current || "현재 문제"}
            />
            <LegendItem
              type="answered"
              label={legendLabels.answered || "푼 문제"}
            />
            <LegendItem
              type="skipped"
              label={legendLabels.skipped || "건너뛴 문제"}
            />
          </div>
        )}

        {/* Custom Content */}
        {children}
      </div>
    );
  }
);
QuestionNavigator.displayName = "QuestionNavigator";

export {
  QuestionNumberButton,
  LegendItem,
  QuestionNavigator,
  questionNumberVariants,
  legendIconVariants,
  questionNavigatorVariants,
};
