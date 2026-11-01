"use client";

import { useState } from "react";
import { ExternalLink, Eye, EyeOff, Info } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { IAiConnection } from "../../interface";
import type { IAiProviderMeta } from "./aiProviders";

type TStatus = "disconnected" | "connecting" | "connected" | "active";

const STATUS_STYLE: Record<TStatus, { label: string; className: string }> = {
  disconnected: { label: "연결 안 됨", className: "bg-[#F3F4F6] text-[#6B7280]" },
  connecting: { label: "연결하는 중…", className: "bg-[#FEF3C7] text-[#B45309]" },
  connected: { label: "연결됨", className: "bg-[#DCFCE7] text-[#15803D]" },
  active: { label: "연결됨 · 사용 중", className: "bg-[#DBEAFE] text-[#155DFC]" },
};

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

interface IAiProviderCardProps {
  meta: IAiProviderMeta;
  connection?: IAiConnection;
  isActive: boolean;
  /** 키 저장 중이거나 OpenRouter 로그인에서 돌아와 키를 교환하는 중 */
  isConnecting: boolean;
  /** 키 검증 실패 등 이 카드에 보여줄 에러 */
  errorMessage?: string;
  onSaveKey: (apiKey: string) => void;
  onBrowserConnect: () => void;
  onUse: () => void;
  onDisconnect: () => void;
}

export const AiProviderCard = ({
  meta,
  connection,
  isActive,
  isConnecting,
  errorMessage,
  onSaveKey,
  onBrowserConnect,
  onUse,
  onDisconnect,
}: IAiProviderCardProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  const status: TStatus = isConnecting
    ? "connecting"
    : connection
      ? isActive
        ? "active"
        : "connected"
      : "disconnected";
  const statusStyle = STATUS_STYLE[status];
  const trimmedKey = apiKey.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedKey) return;
    onSaveKey(trimmedKey);
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-white p-4 sm:p-5",
        isActive ? "border-[#155DFC] shadow-[0_0_0_3px_rgba(21,93,252,0.08)]" : "border-[#E5E7EB]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-[#101828]">{meta.name}</h3>
            {meta.badge && (
              <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-medium text-[#155DFC]">
                {meta.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">{meta.description}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            statusStyle.className
          )}
        >
          {statusStyle.label}
        </span>
      </div>

      <div className="mt-4">
        {connection ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="truncate font-mono text-sm text-[#374151]">
              {connection.maskedKey}
              {formatDate(connection.connectedAt) && (
                <span className="ml-2 font-sans text-xs text-[#9CA3AF]">
                  {formatDate(connection.connectedAt)} 연결
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                disabled={isConnecting}
                className="flex-1 sm:flex-none"
              >
                연결 해제
              </Button>
              <Button
                size="sm"
                onClick={onUse}
                disabled={isActive || isConnecting}
                className="flex-1 sm:flex-none"
              >
                {isActive ? "사용 중" : "이 AI 사용하기"}
              </Button>
            </div>
          </div>
        ) : meta.method === "browser" ? (
          <Button onClick={onBrowserConnect} disabled={isConnecting} className="w-full sm:w-auto">
            {isConnecting ? "연결하는 중…" : "브라우저로 연결"}
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {meta.keyIssueUrl && (
              <a
                href={meta.keyIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[#155DFC] hover:underline"
              >
                {meta.keyIssueLabel}
                <ExternalLink className="size-3.5" />
              </a>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type={isKeyVisible ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={meta.keyPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`${meta.name} API 키`}
                  aria-invalid={!!errorMessage}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-white px-3 pr-10 font-mono text-sm text-[#101828] placeholder:font-sans placeholder:text-[#9CA3AF]",
                    "focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]",
                    errorMessage ? "border-[#EF4444]" : "border-[#E5E7EB]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setIsKeyVisible((v) => !v)}
                  aria-label={isKeyVisible ? "키 숨기기" : "키 보기"}
                  className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {isKeyVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button
                type="submit"
                disabled={!trimmedKey || isConnecting}
                className="h-10 sm:w-20"
              >
                {isConnecting ? "확인 중…" : "연결"}
              </Button>
            </div>
          </form>
        )}

        {errorMessage && (
          <p role="alert" className="mt-2 text-sm text-[#EF4444]">
            {errorMessage}
          </p>
        )}
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-[#F3F4F6] pt-3">
        {meta.notes.map((note) => (
          <li key={note} className="flex gap-1.5 text-xs leading-relaxed text-[#6B7280]">
            <Info className="mt-0.5 size-3.5 shrink-0 text-[#9CA3AF]" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
