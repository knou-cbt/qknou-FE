"use client";

import * as React from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

// ============================================
// Imperative toast API (컴포넌트 트리 밖에서도 호출 가능)
// ============================================

type TToastType = "success" | "error" | "info";

interface IToastItem {
  id: number;
  type: TToastType;
  message: string;
}

type TListener = (toasts: IToastItem[]) => void;

let toasts: IToastItem[] = [];
let nextId = 1;
const listeners = new Set<TListener>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(type: TToastType, message: string) {
  const id = nextId++;
  toasts = [...toasts, { id, type, message }];
  emit();
  window.setTimeout(() => dismiss(id), 3000);
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
};

// ============================================
// Toaster (layout에 한 번 마운트)
// ============================================

const toastConfig: Record<
  TToastType,
  { icon: React.ElementType; className: string; iconClassName: string }
> = {
  success: {
    icon: CheckCircle,
    className: "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]",
    iconClassName: "text-[#22C55E]",
  },
  error: {
    icon: AlertCircle,
    className: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
    iconClassName: "text-[#EF4444]",
  },
  info: {
    icon: Info,
    className: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]",
    iconClassName: "text-[#3B82F6]",
  },
};

export const Toaster = () => {
  const [items, setItems] = React.useState<IToastItem[]>([]);

  React.useEffect(() => {
    const listener: TListener = (next) => setItems(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex w-full max-w-[360px] -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
      {items.map((item) => {
        const config = toastConfig[item.type];
        const Icon = config.icon;
        return (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg",
              config.className
            )}
          >
            <Icon className={cn("size-4 shrink-0", config.iconClassName)} />
            <p className="flex-1 text-sm font-medium">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 rounded-md p-0.5 hover:bg-black/5 cursor-pointer"
              aria-label="닫기"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
