/**
 * 로그인 필요 안내 모달의 전역(imperative) 상태.
 * toast.ts와 동일한 패턴: 컴포넌트 트리 밖(useRequireAuth 등)에서도 호출 가능하고,
 * 실제 렌더링은 AppContent에 한 번 마운트된 LoginPromptModal이 담당한다.
 */

type TListener = (open: boolean) => void;

let open = false;
const listeners = new Set<TListener>();

function emit() {
  listeners.forEach((listener) => listener(open));
}

export function showLoginPrompt() {
  open = true;
  emit();
}

export function hideLoginPrompt() {
  open = false;
  emit();
}

export function subscribeLoginPrompt(listener: TListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
