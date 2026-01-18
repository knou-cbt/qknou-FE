"use client";
import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { BookOpen, Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useExamContext } from "@/contexts";
import { Button, ConfirmModal, AlertModal } from "@/components/ui";

export interface IHeaderProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "exam";
  /** 시험 시간 (초 단위, 기본값: 3000초 = 50분) */
  examDuration?: number;
}

const Header = React.forwardRef<HTMLElement, IHeaderProps>(
  ({ className, variant = "default", examDuration = 3000, ...props }, ref) => {
    const router = useRouter();
    const { onExamEnd, unansweredCount } = useExamContext();
    const [remainingTime, setRemainingTime] = useState(examDuration);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);
    const [showSubmitAlert, setShowSubmitAlert] = useState(false);

    // onExamEnd의 최신 값을 ref로 관리 (타이머 리셋 방지)
    const onExamEndRef = useRef(onExamEnd);
    useEffect(() => {
      onExamEndRef.current = onExamEnd;
    }, [onExamEnd]);

    // 타이머 로직 - variant가 exam일 때만 동작
    useEffect(() => {
      if (variant !== "exam") return;

      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // 시간 종료 시 알럿 표시
            setShowTimeoutAlert(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [variant]);

    // 시간 종료 알럿 확인 시 자동 제출
    const handleTimeoutAlertClose = () => {
      setShowTimeoutAlert(false);
      onExamEndRef.current?.();
    };

    // 시간 포맷팅 (MM:SS)
    const formatTime = useCallback((seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }, []);

    // 시험 종료 버튼 클릭
    const handleExamEndClick = () => {
      if (unansweredCount > 0) {
        // 풀지 않은 문제가 있으면 컨펌 모달 표시
        setShowConfirmModal(true);
      } else {
        // 모든 문제를 풀었으면 바로 제출
        handleConfirmSubmit();
      }
    };

    // 제출 확인
    const handleConfirmSubmit = () => {
      setShowConfirmModal(false);
      setShowSubmitAlert(true);
    };

    // 제출 완료 알럿 확인 시
    const handleSubmitAlertClose = () => {
      setShowSubmitAlert(false);
      onExamEnd?.();
    };

    // 모달 취소
    const handleCancelSubmit = () => {
      setShowConfirmModal(false);
    };

    return (
      <>
        <header
          ref={ref}
          className={cn(
            "box-border flex flex-col items-start px-6 py-4 pb-px w-full h-[77px] bg-white border-b border-[#E5E7EB]",
            className
          )}
          {...props}
        >
          {/* Container */}
          <div className="flex flex-row justify-between items-center w-full max-w-[1392px] h-11 mx-auto">
            {/* Logo Container */}
            <div
              className="flex flex-row items-center gap-3 cursor-pointer"
              onClick={() => router.push("/")}
            >
              {/* Logo Icon */}
              <div className="flex justify-center items-center w-8 h-8 bg-[#155DFC] rounded-[10px]">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              {/* Logo Text */}
              <span className="font-normal text-base leading-6 text-[#101828]">
                문제다모아
              </span>
            </div>

            {/* 시험 모드 */}
            {variant === "exam" && (
              <div className="flex flex-row items-center gap-3">
                {/* Timer */}
                <div className="flex flex-row items-center px-4 gap-2 h-11 bg-[#EFF6FF] rounded-[10px]">
                  <Clock
                    className="w-5 h-5 text-[#155DFC]"
                    strokeWidth={1.67}
                  />
                  <span className="font-normal text-sm leading-7 text-[#155DFC]">
                    {formatTime(remainingTime)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={handleExamEndClick}
                  className="bg-[#FEF2F2] border-[#FFC9C9] text-xs text-[#E7000B] hover:bg-[#FEE2E2] hover:text-[#E7000B]"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.33} />
                  시험 종료
                </Button>
              </div>
            )}

            {/* Navigation - 기본 모드일 때만 표시 */}
            {variant === "default" && (
              <nav className="flex items-center gap-6">
                {/* 네비게이션 메뉴 항목들 */}
              </nav>
            )}
          </div>
        </header>

        {/* 시간 종료 알럿 */}
        <AlertModal
          open={showTimeoutAlert}
          onClose={handleTimeoutAlertClose}
          type="warning"
          title="시험 시간 종료"
          message="시험 시간이 종료되었습니다. 자동으로 제출됩니다."
          confirmText="확인"
        />

        {/* 제출 완료 알럿 */}
        <AlertModal
          open={showSubmitAlert}
          onClose={handleSubmitAlertClose}
          type="success"
          title="시험 제출 완료"
          message="시험이 성공적으로 제출되었습니다."
          confirmText="확인"
        />

        {/* 컨펌 모달 */}
        <ConfirmModal
          open={showConfirmModal}
          onClose={handleCancelSubmit}
          onConfirm={handleConfirmSubmit}
          title="시험 제출 확인"
          message={
            <>
              아직{" "}
              <span className="font-semibold text-[#E7000B]">
                {unansweredCount}개
              </span>
              의 문제를 풀지 않았습니다.
              <br />
              그대로 제출할까요?
            </>
          }
          confirmText="제출하기"
          cancelText="취소"
          confirmVariant="destructive"
        />
      </>
    );
  }
);
Header.displayName = "Header";

export { Header };
