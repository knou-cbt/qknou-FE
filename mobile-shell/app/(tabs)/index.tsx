import { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";

import { BRIDGE_MESSAGE_TYPES, WEBVIEW_URL } from "@/lib/webview-config";

type BridgePayload = {
  type: string;
  payload?: unknown;
};

const injectedBridgeScript = `
  (function() {
    if (window.__QKNOU_RN_BRIDGE_READY__) return;
    window.__QKNOU_RN_BRIDGE_READY__ = true;

    window.qknouBridge = {
      postMessage: function(message) {
        if (!window.ReactNativeWebView) return;
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    };

    window.qknouBridge.postMessage({
      type: "${BRIDGE_MESSAGE_TYPES.READY}",
      payload: { source: "web" }
    });
  })();
  true;
`;

export default function WebViewShellScreen() {
  const webViewRef = useRef<WebView>(null);
  const [bridgeLogs, setBridgeLogs] = useState<string[]>([]);
  const webUrl = useMemo(() => WEBVIEW_URL, []);

  const appendLog = (value: string) => {
    setBridgeLogs((prev) => [value, ...prev].slice(0, 8));
  };

  const postToWeb = (message: BridgePayload) => {
    webViewRef.current?.postMessage(JSON.stringify(message));
    appendLog(`RN -> WEB: ${message.type}`);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    appendLog(`WEB -> RN: ${event.nativeEvent.data}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>QKNOU WebView Shell</Text>
          <Text style={styles.subtitle}>{webUrl}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              postToWeb({
                type: BRIDGE_MESSAGE_TYPES.OPEN_LOGIN,
                payload: { source: "rn-shell" },
              })
            }
          >
            <Text style={styles.secondaryButtonText}>OPEN_LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              postToWeb({
                type: BRIDGE_MESSAGE_TYPES.REQUEST_TOKEN,
                payload: { source: "rn-shell" },
              })
            }
          >
            <Text style={styles.primaryButtonText}>REQUEST_TOKEN</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.logPanel}>
        <Text style={styles.logTitle}>Bridge Logs</Text>
        {bridgeLogs.length === 0 ? (
          <Text style={styles.logItem}>No bridge messages yet.</Text>
        ) : (
          bridgeLogs.map((log, index) => (
            <Text key={`${log}-${index}`} style={styles.logItem}>
              {log}
            </Text>
          ))
        )}
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: webUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={injectedBridgeScript}
        startInLoadingState
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTextGroup: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#155dfc",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },
  logPanel: {
    margin: 12,
    borderRadius: 16,
    backgroundColor: "#111827",
    padding: 12,
    gap: 6,
  },
  logTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  logItem: {
    color: "#d1d5db",
    fontSize: 12,
  },
  webview: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
