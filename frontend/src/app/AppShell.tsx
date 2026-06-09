import { Badge, Layout, Menu, Space, Tag, Typography } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { apiBaseUrl } from "../api/http";
import { getNavigationItem, navigationItems } from "./navigation";

const headerSubtitle = "Controle centralizado de prazos, status e entregas acessórias.";

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeItem = getNavigationItem(pathname);
  const hideHeader = ["/dashboard", "/calendario", "/alertas", "/empresas"].some((path) => pathname === path);
  const contentClassName = hideHeader
    ? "box-border min-w-0 w-full max-w-none px-5 pb-8 pt-[18px] max-[720px]:w-auto max-[720px]:p-3"
    : "box-border min-w-0 w-full max-w-none px-7 pb-8 pt-6 max-[720px]:w-auto max-[720px]:p-4";

  return (
    <Layout className="min-h-screen max-[720px]:flex-col">
      <Layout.Sider
        width={264}
        className="sticky top-0 h-screen overflow-auto max-[720px]:!relative max-[720px]:!h-auto max-[720px]:!w-full max-[720px]:!min-w-0 max-[720px]:!max-w-none max-[720px]:!flex-none max-[720px]:[&_.ant-layout-sider-children]:grid max-[720px]:[&_.ant-menu]:!grid max-[720px]:[&_.ant-menu]:!grid-cols-1 max-[720px]:[&_.ant-menu]:gap-2 max-[720px]:[&_.ant-menu]:overflow-visible max-[720px]:[&_.ant-menu]:px-2 max-[720px]:[&_.ant-menu]:pb-2.5 max-[720px]:[&_.ant-menu-item]:!m-0 max-[720px]:[&_.ant-menu-item]:!w-full max-[720px]:[&_.ant-menu-item]:!min-w-0"
      >
        <div className="flex min-h-[76px] items-center gap-3 px-5 py-[18px] text-white max-[720px]:min-h-16 max-[720px]:px-4 max-[720px]:py-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#00acc1] font-extrabold text-white">PA</div>
          <div>
            <Typography.Text className="block !font-bold !leading-[1.2] !text-white">
              Painel de Obrigações
            </Typography.Text>
            <Typography.Text className="block !text-xs !leading-[1.2] !text-white opacity-70">
              Calendário fiscal
            </Typography.Text>
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={activeItem ? [activeItem.key] : []}
          items={navigationItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.path}>{item.label}</Link>
          }))}
        />
      </Layout.Sider>

      <Layout className="max-[720px]:w-full max-[720px]:flex-none">
        {!hideHeader && (
          <Layout.Header className="flex h-auto min-h-[88px] items-center justify-between gap-4 border-b border-[#dbe5ef] px-7 py-[18px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:p-4 [&_h2.ant-typography]:!mb-1 [&_h2.ant-typography]:!mt-0">
            <div>
              <Typography.Title level={2}>{activeItem?.title ?? "Página não encontrada"}</Typography.Title>
              <Typography.Text type="secondary">{headerSubtitle}</Typography.Text>
            </div>

            <Space wrap>
              <Badge status="processing" text="API local" />
              <Tag icon={<DatabaseOutlined />} color="blue">
                {apiBaseUrl}
              </Tag>
            </Space>
          </Layout.Header>
        )}

        <Layout.Content className={contentClassName}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
