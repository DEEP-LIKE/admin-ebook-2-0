import type { ThemeConfig } from "antd";

export const fordTheme: ThemeConfig = {
  token: {
    colorPrimary: "#003478",
    colorSuccess: "#10B981",
    colorWarning: "#F59E0B",
    colorError: "#EF4444",
    colorInfo: "#3B82F6",
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      siderBg: "#001529",
    },
    Menu: {
      itemBorderRadius: 8,
      itemSelectedBg: "#003478",
      itemSelectedColor: "#ffffff",
    },
    Button: {
      borderRadius: 8,
      fontWeight: 600,
    },
  },
};
