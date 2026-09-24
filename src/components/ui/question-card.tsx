"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";

import { cn } from "@/lib/utils";
import {
  preserveLineBreaksForMarkdown,
  preprocessMathText,
} from "@/lib/math-text";

// inline: block 요소 제거하고 수식/HTML 렌더링
const inlineComponents: Components = {
  p: ({ children }) => <>{children}</>,
  ol: ({ children }) => <>{children}</>,
  ul: ({ children }) => <>{children}</>,
  li: ({ children }) => <>{children}</>,
};

function InlineMathContent({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={inlineComponents}
    >
      {text}
    </ReactMarkdown>
  );
}

// block: 코드/수식/HTML 포함 다중 단락 렌더링
function BlockMathContent({ text }: { text: string }) {
  return (
    <div className="[&_code]:rounded [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-[#111827] [&_pre]:p-3 [&_pre]:text-[#F9FAFB] [&_.katex-display]:overflow-x-auto">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {preserveLineBreaksForMarkdown(text)}
      </ReactMarkdown>
    </div>
  );
}

function filterValidImageUrls(urls?: string[] | null): string[] {
  return (urls ?? []).filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0
  );
}

function QuestionImageList({
  urls,
  altPrefix,
}: {
  urls: string[];
  altPrefix: string;
}) {
  if (urls.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {urls.map((url, index) => (
        <div
          key={`${url}-${index}`}
          className="relative w-full h-[70px] sm:h-[120px] overflow-hidden rounded-[12px] border border-[#E5E7EB]"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          <Image
            src={url}
            alt={`${altPrefix} ${index + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 1100px"
            className="object-contain p-2"
            unoptimized
            loading="lazy"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Shared Example (공통 보기) Toggle
// ============================================

function SharedExampleToggle({
  text,
  imageUrls,
}: {
  text?: string | null;
  imageUrls?: string[] | null;
}) {
  const [open, setOpen] = useState(true);
  const validImageUrls = filterValidImageUrls(imageUrls);
  const trimmedText = text?.trim() ?? "";

  const rangeMatch = trimmedText.match(/\((\d+~\d+)\)/);
  const rangeLabel = rangeMatch
    ? `공통 보기 (${rangeMatch[1]}번)`
    : "공통 보기";

  const contentMatch = trimmedText.match(/<보기>([\s\S]*?)<\/보기>/);
  const content = contentMatch
    ? contentMatch[1].trim()
    : trimmedText
      ? preprocessMathText(trimmedText)
      : "";

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-[12px] text-sm font-medium text-[#364153] hover:bg-[#E9EAEB] transition-colors"
      >
        <span className="flex-1 text-left">{rangeLabel}</span>
        <svg
          className={cn("w-4 h-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-sm text-[#364153] leading-6 break-words [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-5">
          {content && <BlockMathContent text={content} />}
          {validImageUrls.length > 0 && (
            <div className={cn(content && "mt-3")}>
              <QuestionImageList urls={validImageUrls} altPrefix="공통 보기 이미지" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
        // 결과 화면에서 정답: 클릭(선택)된 UI와 동일하게 표시해 튀지 않게 한다
        correct: "border-[#155DFC] bg-[#EFF6FF]",
        // 결과 화면에서 정답이 아닌 나머지 선택지: 회색으로 눌러서 정답이 도드라지게 한다
        incorrect: "border-[#E5E7EB] bg-[#F9FAFB] opacity-60 cursor-not-allowed",
        // 결과 화면에서 내가 골랐지만 틀린 선택지: 같은 회색 계열이되, 내 선택이었다는 건 알아볼 수 있게 테두리를 조금 진하게
        incorrectSelected:
          "border-[#9CA3AF] bg-[#F3F4F6] cursor-not-allowed",
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
        correct: "bg-white border-[#155DFC]",
        incorrect: "bg-white border-[#D1D5DC]",
        incorrectSelected: "bg-white border-[#9CA3AF]",
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
  state?:
    | "default"
    | "selected"
    | "correct"
    | "incorrect"
    | "incorrectSelected"
    | "disabled";
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
        aria-checked={state === "selected" || state === "incorrectSelected"}
        tabIndex={state === "disabled" ? -1 : 0}
        {...props}
      >
        {/* Radio Circle: 정답/선택은 채운 원, 내가 골랐지만 틀린 선택지는 회색 원으로 표시, 나머지는 빈 원 */}
        <div className={cn(radioVariants({ state }), "shrink-0 mt-0.5")}>
          {(state === "selected" || state === "correct") && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#155DFC]" />
          )}
          {state === "incorrectSelected" && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]" />
          )}
        </div>

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
  "flex flex-col items-start rounded-[16px] w-full",
  {
    variants: {
      size: {
        default: "max-w-[1066px] pt-6 sm:pt-8 pb-0 gap-4 sm:gap-6",
        sm: "w-full max-w-[600px] pt-4 sm:pt-6 pb-0 gap-3 sm:gap-4",
        lg: "w-full max-w-[1200px] pt-6 sm:pt-10 pb-0 gap-4 sm:gap-6",
        full: "w-full pb-0 gap-4 sm:gap-6",
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
  imageUrls?: string[] | null;
}

export interface IQuestionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questionCardVariants> {
  tags?: IQuestionTag[];
  question?: string;
  example?: string | null;
  sharedExample?: string | null;
  sharedExampleImageUrls?: string[] | null;
  imageUrls?: string[] | null;
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
      sharedExample,
      sharedExampleImageUrls,
      imageUrls,
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
    const processedQuestion = question ? preprocessMathText(question) : undefined;
    const processedExample = example ? preprocessMathText(example) : undefined;
    const validImageUrls = filterValidImageUrls(imageUrls);
    const validSharedExampleImageUrls =
      filterValidImageUrls(sharedExampleImageUrls);
    const hasSharedExample =
      Boolean(sharedExample?.trim()) || validSharedExampleImageUrls.length > 0;

    const getAnswerState = (
      value: string | number
    ): "default" | "selected" | "correct" | "incorrect" | "incorrectSelected" => {
      if (showResult) {
        // 복수 정답 지원: 배열에 포함되어 있으면 정답. 그 외 나머지는 회색으로 눌러
        // 정답을 도드라지게 하되, 내가 골랐던 오답은 회색 원으로 표시를 남겨 구분한다
        if (correctAnswer.includes(value)) return "correct";
        if (value === selectedAnswer) return "incorrectSelected";
        return "incorrect";
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

          {/* Shared Example (공통 보기) */}
          {hasSharedExample && (
            <div className="w-full px-4 sm:px-0">
              <SharedExampleToggle
                text={sharedExample}
                imageUrls={validSharedExampleImageUrls}
              />
            </div>
          )}

          {/* Question Text */}
          {processedQuestion && (
            <div className="font-normal text-base sm:text-[19px] leading-6 sm:leading-[31px] text-[#101828] w-full wrap-break-word px-4 sm:px-0">
              <InlineMathContent text={processedQuestion} />
            </div>
          )}

          {/* Example (보기) */}
          {processedExample && (
            <div className="w-full mt-4 px-4 sm:px-0">
              <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] font-normal text-sm sm:text-base leading-6 text-[#364153] break-words [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-5">
                <BlockMathContent text={processedExample} />
              </div>
            </div>
          )}

          {/* Question Images */}
          {validImageUrls.length > 0 && (
            <div className="w-full mt-4 px-4 sm:px-0">
              <QuestionImageList urls={validImageUrls} altPrefix="문항 이미지" />
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
                {answer.imageUrls && answer.imageUrls.length > 0 ? (
                  <div className="flex flex-col gap-2 w-full">
                    {answer.imageUrls.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="relative w-full h-[80px] sm:h-[120px] overflow-hidden rounded-[8px]"
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                      >
                        <Image
                          src={imgUrl}
                          alt={`선택지 ${answer.value} 이미지`}
                          fill
                          className="object-contain"
                          unoptimized
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <InlineMathContent text={preprocessMathText(answer.label)} />
                )}
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
