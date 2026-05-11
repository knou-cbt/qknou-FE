# QKNOU Mobile Shell

작은 React Native WebView shell 앱이다. 현재 Next.js 웹 앱을 감싸고, RN <-> Web 브릿지 학습용으로 사용한다.

## 실행

```bash
cd mobile-shell
npm install
npx expo start
```

## WebView URL

기본 URL은 [`lib/webview-config.ts`](./lib/webview-config.ts)에 있다.

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://localhost:3000`

환경변수로 덮어쓸 수도 있다.

```bash
EXPO_PUBLIC_WEBVIEW_URL=http://192.168.0.10:3000 npx expo start
```

## 브릿지 구조

### RN -> Web

RN에서는 `webViewRef.current?.postMessage(...)`로 웹에 메시지를 보낸다.

현재 예제 버튼:

- `OPEN_LOGIN`
- `REQUEST_TOKEN`

### Web -> RN

웹에서는 `window.ReactNativeWebView.postMessage(...)`로 RN에 메시지를 보낸다.

현재 shell은 페이지 로드 전에 아래 helper를 주입한다.

- `window.qknouBridge.postMessage(message)`

## 다음 단계

현재 웹 프로젝트에도 브릿지 유틸을 하나 두고 아래 계약부터 맞추면 된다.

- `READY`
- `OPEN_LOGIN`
- `REQUEST_TOKEN`
- `LOG`
