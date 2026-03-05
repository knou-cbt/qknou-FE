import { useEffect } from "react";

type CopyProtectionOptions = {
  enabled?: boolean;
};

export const useCopyProtection = ({
  enabled = true,
}: CopyProtectionOptions = {}) => {
  useEffect(() => {
    if (!enabled) return;

    const preventDefault = (event: Event) => {
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
    document.addEventListener("paste", preventDefault);
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("selectstart", preventDefault as EventListener);
    document.addEventListener("dragstart", preventDefault);
    document.addEventListener("keydown", preventCopyHotkey);

    return () => {
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("paste", preventDefault);
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

