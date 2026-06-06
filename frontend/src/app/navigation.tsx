import type { ReactNode } from "react";
import { ApartmentOutlined, CalendarOutlined, DashboardOutlined } from "@ant-design/icons";

export type AppRouteKey = "dashboard" | "calendario" | "empresas";
export type AppRoutePath = "/dashboard" | "/calendario" | "/empresas";

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
    label: "Relatorio",
    title: "Relatorio fiscal",
    icon: <DashboardOutlined />
  },
  {
    key: "calendario",
    path: "/calendario",
    label: "Calendario",
    title: "Calendario de obrigacoes",
    icon: <CalendarOutlined />
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
