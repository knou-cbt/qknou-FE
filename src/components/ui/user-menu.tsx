"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { LogOut, ChevronDown, FileUp, Loader2, User, MessageSquare, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  FeedbackModal,
  useFeedbackModal,
} from "@/components/feedback/FeedbackModal";
import {
  ExamSubmissionModal,
  useExamSubmissionModal,
} from "@/components/exam-submission/ExamSubmissionModal";

export const UserMenu = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    feedbackModalOpen,
    feedbackModalDefaultType,
    feedbackModalQuestionId,
    openFeedbackModal,
    closeFeedbackModal,
  } = useFeedbackModal();
  const {
    examSubmissionModalOpen,
    openExamSubmissionModal,
    closeExamSubmissionModal,
  } = useExamSubmissionModal();

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 모바일 전체화면 메뉴가 열려있는 동안 배경 스크롤 방지
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 로그아웃 처리에 약간의 딜레이를 주어 사용자 경험 개선
      await new Promise((resolve) => setTimeout(resolve, 500));
      logout();
      setIsOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* 메뉴 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200",
          "hover:bg-gray-100",
          isOpen && "bg-gray-100"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-[#155DFC] flex items-center justify-center">
          <Image
              src={user.profileImage || "/user-profile.png"}
              alt={user.name || "user profile image"}

              width={32}
              height={32}
              className="w-full h-full rounded-full object-cover"
            />
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.name}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 transition-transform duration-200 hidden sm:block",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* 드롭다운 메뉴: 모바일/태블릿(md 미만)에서는 화면 전체를 덮는 패널, md 이상에서는 기존 팝오버 */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-white p-4",
            "md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-56 md:rounded-lg md:border md:border-gray-200 md:bg-white md:p-0 md:shadow-lg"
          )}
        >
          {/* 모바일 전용 상단바 */}
          <div className="mb-2 flex items-center justify-between md:hidden">
            <span className="text-base font-semibold text-gray-900">메뉴</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 메뉴 항목들 */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/mypage");
              }}
              className="w-full flex items-center gap-3 px-2 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors rounded-lg md:px-4 md:py-2 md:text-sm md:rounded-none"
            >
              <User className="w-5 h-5 md:w-4 md:h-4" />
              마이페이지
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                openFeedbackModal();
              }}
              className="w-full flex items-center gap-3 px-2 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors rounded-lg md:px-4 md:py-2 md:text-sm md:rounded-none"
            >
              <MessageSquare className="w-5 h-5 md:w-4 md:h-4" />
              피드백
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                openExamSubmissionModal();
              }}
              className="w-full flex items-center gap-3 px-2 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors rounded-lg md:px-4 md:py-2 md:text-sm md:rounded-none"
            >
              <FileUp className="w-5 h-5 md:w-4 md:h-4" />
              시험지 등록
            </button>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "w-full flex items-center gap-3 px-2 py-3 text-base text-red-600 hover:bg-red-50 transition-colors rounded-lg md:px-4 md:py-2 md:text-sm md:rounded-none",
                isLoggingOut && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
                  로그아웃 중...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 md:w-4 md:h-4" />
                  로그아웃
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <FeedbackModal
        open={feedbackModalOpen}
        onClose={closeFeedbackModal}
        defaultType={feedbackModalDefaultType}
        questionId={feedbackModalQuestionId}
      />
      <ExamSubmissionModal
        open={examSubmissionModalOpen}
        onClose={closeExamSubmissionModal}
      />
    </div>
  );
};
