"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { API_URL } from "@/constants";

const LoginPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleKakaoLogin = () => {
    window.location.href = `${API_URL}/auth/kakao`;
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-b from-[#F9FAFB] to-[#EFF6FF] px-4 pt-20">
      <div className="w-full max-w-md">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Image
              src="/logo.svg"
              alt="QKNOU LOGO"
              width={96}
              height={96}
              className="w-24 h-24"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            큐노에 오신 것을 환영합니다
          </h1>
          <p className="text-gray-600">
            방송통신대학교 기출문제를 풀어보세요
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            로그인
          </h2>

          <div className="space-y-3">
            {/* Google 로그인 버튼 */}
            <button
              onClick={handleGoogleLogin}
              className="w-full h-[45px] flex items-center justify-center gap-3 px-4 bg-[#F2F2F2] rounded border border-gray-300 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.6 10.2273C19.6 9.51823 19.5364 8.83637 19.4182 8.18182H10V12.05H15.3818C15.15 13.3 14.4455 14.3591 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2727 19.6 10.2273V10.2273Z" fill="#4285F4"/>
                <path d="M10 20C12.7 20 14.9636 19.1045 16.6181 17.5773L13.3863 15.0682C12.4909 15.6682 11.3454 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2636 4.40455 11.9H1.06364V14.4909C2.70909 17.7591 6.09091 20 10 20Z" fill="#34A853"/>
                <path d="M4.40455 11.9C4.20455 11.3 4.09091 10.6591 4.09091 10C4.09091 9.34091 4.20455 8.7 4.40455 8.1V5.50909H1.06364C0.386364 6.85909 0 8.38636 0 10C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.9V11.9Z" fill="#FBBC04"/>
                <path d="M10 3.97727C11.4681 3.97727 12.7863 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6954 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z" fill="#E94235"/>
              </svg>
              <span className="font-medium text-sm text-[#1F1F1F]">구글 로그인</span>
            </button>

            {/* Kakao 로그인 버튼 - 디자인 가이드 준수 */}
            <button
              onClick={handleKakaoLogin}
              className="w-full h-[45px] flex items-center justify-center gap-3 px-4 rounded hover:opacity-90 transition-opacity duration-200 cursor-pointer"
              style={{ backgroundColor: '#FEE500' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 3C5.029 3 1 6.336 1 10.5C1 13.122 2.716 15.422 5.312 16.764L4.46 19.866C4.394 20.107 4.637 20.31 4.856 20.196L8.252 17.931C8.829 18.01 9.421 18.05 10 18.05C14.971 18.05 19 14.714 19 10.5C19 6.286 14.971 3 10 3Z" fill="#000000"/>
              </svg>
              <span className="font-medium text-sm" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                카카오 로그인
              </span>
            </button>
          </div>

          {/* 약관 동의 */}
          <p className="text-xs text-gray-500 text-center mt-6">
            로그인하시면{" "}
            <Link href="/terms" className="text-[#155DFC] hover:underline">
              이용약관
            </Link>{" "}
            및{" "}
            <Link href="/privacy" className="text-[#155DFC] hover:underline">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>

   
      </div>
    </div>
  );
};

export default LoginPage;
