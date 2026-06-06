import { QueryClientProvider } from "@tanstack/react-query";
import { App as AntApp, ConfigProvider, theme } from "antd";
import ptBR from "antd/locale/pt_BR";
import type { PropsWithChildren } from "react";
import { queryClient } from "./queryClient";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1565C0",
          colorSuccess: "#2E7D32",
          colorWarning: "#F57F17",
          colorError: "#C62828",
          colorInfo: "#1E88E5",
          borderRadius: 8,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        },
        components: {
          Layout: {
            siderBg: "#0D1B2A",
            headerBg: "#ffffff",
            bodyBg: "#eef3f8"
          },
          Menu: {
            darkItemBg: "#0D1B2A",
            darkSubMenuItemBg: "#0D1B2A",
            darkItemSelectedBg: "#1565C0"
          },
          Card: {
            borderRadiusLG: 8
          }
        }
      }}
    >
      <AntApp>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}
