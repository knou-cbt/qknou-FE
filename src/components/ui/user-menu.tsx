"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
    logout();
    setIsOpen(false);
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

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* 사용자 정보 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name || "사용자"}</p>
            {user.email && (
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            )}
            {user.provider && (
              <p className="text-xs text-gray-400 mt-1 capitalize">
                {user.provider} 계정
              </p>
            )}
          </div>

          {/* 메뉴 항목들 */}
          <div className="py-1">
            {/* 마이페이지 (추후 구현) */}
            {/* <button
              onClick={() => {
                setIsOpen(false);
                // navigate to profile
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              마이페이지
            </button> */}

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
