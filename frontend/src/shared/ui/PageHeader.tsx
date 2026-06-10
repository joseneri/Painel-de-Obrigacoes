import type { ReactNode } from "react";
import { Typography } from "antd";
import { pageHeaderClassName, pageSubtitleClassName, pageTitleClassName } from "./styles";

interface PageHeaderProps {
  title: string;
  subtitle: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={pageHeaderClassName}>
      <div>
        <Typography.Title className={pageTitleClassName} level={2}>
          {title}
        </Typography.Title>
        <Typography.Text className={pageSubtitleClassName} type="secondary">
          {subtitle}
        </Typography.Text>
      </div>
      {actions}
    </div>
  );
}
