import { Platform } from "react-native";

const LOCAL_WEB_URL = Platform.select({
  android: "http://10.0.2.2:3000",
  ios: "http://localhost:3000",
  default: "http://localhost:3000",
});

export const WEBVIEW_URL = process.env.EXPO_PUBLIC_WEBVIEW_URL ?? LOCAL_WEB_URL;

export const BRIDGE_MESSAGE_TYPES = {
  READY: "READY",
  OPEN_LOGIN: "OPEN_LOGIN",
  REQUEST_TOKEN: "REQUEST_TOKEN",
  LOG: "LOG",
} as const;

