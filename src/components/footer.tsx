"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { FeedbackModal, useFeedbackModal } from "@/components/feedback/FeedbackModal"

export interface IFooterProps extends React.HTMLAttributes<HTMLElement> { } // eslint-disable-line @typescript-eslint/no-empty-object-type

const Footer = React.forwardRef<HTMLElement, IFooterProps>(
  ({ className, ...props }, ref) => {
    const {
      feedbackModalOpen,
      feedbackModalDefaultType,
      feedbackModalQuestionId,
      openFeedbackModal,
      closeFeedbackModal,
    } = useFeedbackModal();

    return (
      <footer
        ref={ref}
        className={cn(
          "border-t border-[#E5E7EB] bg-white mt-auto",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 text-center text-[#6B7280] text-xs md:text-sm space-y-1 md:space-y-2">
          <p>
            QKNOU는 지난 방통대 기출문제를 온라인에서 풀이해 볼 수 있는 무료사이트입니다.
          </p>
          <p>
            기출문제 출제·저작권은{" "}
            <a
              href="https://www.knou.ac.kr"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-blue-600 hover:underline"
            >
              방송통신대학교(KNOU)
            </a>
            에 있으며, 사이트 이용 중 발견한 오류나 의견은{" "}
            <button
              type="button"
              onClick={() => openFeedbackModal()}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              피드백 보내기
            </button>
            로 알려주세요.
          </p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3">
            <span>© 2025 QKNOU. All rights reserved.</span>
            <Link href="/terms" className="text-[#6B7280] hover:text-[#155DFC] hover:underline">
              이용약관
            </Link>
            <Link href="/privacy" className="text-[#6B7280] hover:text-[#155DFC] hover:underline">
              개인정보처리방침
            </Link>
          </p>
        </div>

        <FeedbackModal
          open={feedbackModalOpen}
          onClose={closeFeedbackModal}
          defaultType={feedbackModalDefaultType}
          questionId={feedbackModalQuestionId}
        />
      </footer>
    )
  }
)
Footer.displayName = "Footer"

export { Footer }
