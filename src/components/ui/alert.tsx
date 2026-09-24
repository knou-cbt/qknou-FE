import * as React from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Modal, ModalContent } from "./modal";

// ============================================
// Alert Types
// ============================================

type TAlertType = "success" | "error" | "warning" | "info";

const alertConfig: Record<
  TAlertType,
  {
    icon: React.ElementType;
    iconBgColor: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  success: {
    icon: CheckCircle,
    iconBgColor: "bg-[#DCFCE7]",
    iconColor: "text-[#22C55E]",
    titleColor: "text-[#166534]",
  },
  error: {
    icon: AlertCircle,
    iconBgColor: "bg-[#FEE2E2]",
    iconColor: "text-[#EF4444]",
    titleColor: "text-[#991B1B]",
  },
  warning: {
    icon: AlertTriangle,
    iconBgColor: "bg-[#FEF3C7]",
    iconColor: "text-[#F59E0B]",
    titleColor: "text-[#92400E]",
  },
  info: {
    icon: Info,
    iconBgColor: "bg-[#DBEAFE]",
    iconColor: "text-[#3B82F6]",
    titleColor: "text-[#1E40AF]",
  },
};

// ============================================
// Alert Modal
// ============================================

interface IAlertModalProps {
  open: boolean;
  onClose: () => void;
  type?: TAlertType;
  title: string;
  message?: React.ReactNode;
  confirmText?: string;
}

const AlertModal = ({
  open,
  onClose,
  type = "info",
  title,
  message,
  confirmText = "확인",
}: IAlertModalProps) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent size="sm">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4 shrink-0", config.iconColor)} />
          <h3 className="text-base font-semibold text-[#101828]">{title}</h3>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-2 text-sm text-[#6B7280]">{message}</p>
        )}

        {/* Button */}
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose} size="sm">
            {confirmText}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

// ============================================
// Inline Alert (Toast-like, 인라인 알럿)
// ============================================

interface IInlineAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: TAlertType;
  title?: string;
  message: React.ReactNode;
  onClose?: () => void;
}

const InlineAlert = React.forwardRef<HTMLDivElement, IInlineAlertProps>(
  ({ className, type = "info", title, message, onClose, ...props }, ref) => {
    const config = alertConfig[type];
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-3 p-4 rounded-xl border",
          type === "success" && "bg-[#F0FDF4] border-[#BBF7D0]",
          type === "error" && "bg-[#FEF2F2] border-[#FECACA]",
          type === "warning" && "bg-[#FFFBEB] border-[#FDE68A]",
          type === "info" && "bg-[#EFF6FF] border-[#BFDBFE]",
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
            config.iconBgColor
          )}
        >
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn("font-semibold text-sm", config.titleColor)}>
              {title}
            </h4>
          )}
          <p className="text-sm text-[#4B5563]">{message}</p>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        )}
      </div>
    );
  }
);
InlineAlert.displayName = "InlineAlert";

export { AlertModal, InlineAlert, type TAlertType };

