export type SidebarProps = {
  identifier: string;
};

export type PageHeaderProps = {
  title: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
};

export type FooterProps = Record<string, never>;
