import type { ReactNode } from "react";
import { AlertOutlined, ApartmentOutlined, CalendarOutlined, DashboardOutlined } from "@ant-design/icons";

export type AppRouteKey = "dashboard" | "calendario" | "alertas" | "empresas";
export type AppRoutePath = "/dashboard" | "/calendario" | "/alertas" | "/empresas";

export interface NavigationItem {
  key: AppRouteKey;
  path: AppRoutePath;
  label: string;
  title: string;
  icon: ReactNode;
}

export const navigationItems: NavigationItem[] = [
  {
    key: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    title: "Dashboard",
    icon: <DashboardOutlined />
  },
  {
    key: "calendario",
    path: "/calendario",
    label: "Calendário",
    title: "Calendário de obrigações",
    icon: <CalendarOutlined />
  },
  {
    key: "alertas",
    path: "/alertas",
    label: "Painel de Alertas",
    title: "Painel de Alertas",
    icon: <AlertOutlined />
  },
  {
    key: "empresas",
    path: "/empresas",
    label: "Empresas",
    title: "Empresas",
    icon: <ApartmentOutlined />
  }
];

export function getNavigationItem(pathname: string) {
  return navigationItems.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
}
