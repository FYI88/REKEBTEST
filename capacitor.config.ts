import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ma.rkeb.demo",
  appName: "Rkeb",
  webDir: "dist-mobile",
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: "DARK",
    },
  },
};

export default config;
