import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

// ============================================
// Modal Overlay
// ============================================

interface IModalOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const ModalOverlay = React.forwardRef<HTMLDivElement, IModalOverlayProps>(
  ({ className, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("absolute inset-0 bg-black/50", className)}
        onClick={onClose}
        {...props}
      />
    );
  }
);
ModalOverlay.displayName = "ModalOverlay";

// ============================================
// Modal Content
// ============================================

interface IModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const modalSizeClasses = {
  sm: "max-w-[320px]",
  md: "max-w-[400px]",
  lg: "max-w-[560px]",
};

const ModalContent = React.forwardRef<HTMLDivElement, IModalContentProps>(
  ({ className, size = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-10 bg-white rounded-xl p-6 w-full mx-4 shadow-xl",
          modalSizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalContent.displayName = "ModalContent";

// ============================================
// Modal Header
// ============================================

interface IModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
  onClose?: () => void;
}

const ModalHeader = React.forwardRef<HTMLDivElement, IModalHeaderProps>(
  (
    { className, showCloseButton = false, onClose, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between mb-3", className)}
        {...props}
      >
        <h3 className="text-lg font-semibold text-[#101828]">{children}</h3>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        )}
      </div>
    );
  }
);
ModalHeader.displayName = "ModalHeader";

// ============================================
// Modal Body
// ============================================

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-[#4B5563] mb-6", className)}
      {...props}
    />
  );
});
ModalBody.displayName = "ModalBody";

// ============================================
// Modal Footer
// ============================================

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex gap-3", className)} {...props} />;
});
ModalFooter.displayName = "ModalFooter";

// ============================================
// Modal (Container)
// ============================================

interface IModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ open, onClose, children }: IModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <ModalOverlay onClose={onClose} />
      {children}
    </div>
  );
};

// ============================================
// Confirm Modal (미리 만들어진 확인 모달)
// ============================================

interface IConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
}

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  confirmVariant = "default",
}: IConfirmModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={cn(
              "flex-1",
              confirmVariant === "destructive" &&
                "bg-[#E7000B] hover:bg-[#C00] text-white"
            )}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmModal,
};
