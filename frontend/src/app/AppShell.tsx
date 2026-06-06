import { Badge, Layout, Menu, Space, Tag, Typography } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { apiBaseUrl } from "../api/http";
import { getNavigationItem, navigationItems } from "./navigation";

const headerSubtitle = "Controle centralizado de prazos, status e entregas acessorias.";

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeItem = getNavigationItem(pathname);

  return (
    <Layout className="app-shell">
      <Layout.Sider width={264} breakpoint="lg" collapsedWidth={0} className="app-sidebar">
        <div className="brand">
          <div className="brand-mark">PA</div>
          <div>
            <Typography.Text className="brand-title">Painel de Obrigacoes</Typography.Text>
            <Typography.Text className="brand-subtitle">Calendario fiscal</Typography.Text>
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

      <Layout>
        <Layout.Header className="app-header">
          <div>
            <Typography.Title level={2}>{activeItem?.title ?? "Pagina nao encontrada"}</Typography.Title>
            <Typography.Text type="secondary">{headerSubtitle}</Typography.Text>
          </div>

          <Space wrap>
            <Badge status="processing" text="API local" />
            <Tag icon={<DatabaseOutlined />} color="blue">
              {apiBaseUrl}
            </Tag>
          </Space>
        </Layout.Header>

        <Layout.Content className="app-content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
