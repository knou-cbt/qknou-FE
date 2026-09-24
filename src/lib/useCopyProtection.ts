import { useEffect } from "react";

type CopyProtectionOptions = {
  enabled?: boolean;
};

/**
 * 이 속성이 있는 요소(또는 그 자손) 안에서는 붙여넣기를 허용한다.
 * (예: 피드백 모달의 내용 입력창)
 *
 * paste 리스너를 document에 붙이는 방식이라 React 이벤트의 stopPropagation()으로는
 * 막을 수 없는 경우가 있어(Next.js가 document에 직접 루트를 마운트하는 경우, 두
 * 리스너가 같은 노드에 붙어 등록 순서로 실행되고 stopPropagation은 다른 리스너를
 * 막지 못함) — target 기준으로 명시적으로 예외 처리한다.
 */
const PASTE_ALLOWED_ATTR = "data-allow-paste";

export const useCopyProtection = ({
  enabled = true,
}: CopyProtectionOptions = {}) => {
  useEffect(() => {
    if (!enabled) return;

    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    const preventPaste = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[${PASTE_ALLOWED_ATTR}]`)) return;
      event.preventDefault();
    };

    const preventCopyHotkey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "c" || key === "x" || key === "a") {
        event.preventDefault();
      }
    };

    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("paste", preventPaste);
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("selectstart", preventDefault as EventListener);
    document.addEventListener("dragstart", preventDefault);
    document.addEventListener("keydown", preventCopyHotkey);

    return () => {
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("paste", preventPaste);
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener(
        "selectstart",
        preventDefault as EventListener
      );
      document.removeEventListener("dragstart", preventDefault);
      document.removeEventListener("keydown", preventCopyHotkey);
    };
  }, [enabled]);
};

