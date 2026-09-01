import type {CapacitorConfig} from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.furkansel.yksdefterim",
  appName: "YKS Defterim",
  webDir: "dist",
  loggingBehavior: "none",
  server: {
    androidScheme: "https",
    cleartext: false
  },
  android: {
    backgroundColor: "#EFF2F8",
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
    loggingBehavior: "none"
  }
};

export default config;
