export type NativeBridgeMessage<T = unknown> = {
  type: string;
  payload?: T;
};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export function isRunningInNativeWebView() {
  if (typeof window === "undefined") return false;
  return typeof window.ReactNativeWebView?.postMessage === "function";
}

export function postMessageToNativeApp<T = unknown>(
  message: NativeBridgeMessage<T>
) {
  if (!isRunningInNativeWebView()) return false;

  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  return true;
}

export function parseNativeBridgeMessage(
  data: string
): NativeBridgeMessage | null {
  try {
    return JSON.parse(data) as NativeBridgeMessage;
  } catch {
    return null;
  }
}

