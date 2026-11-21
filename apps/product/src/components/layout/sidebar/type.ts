export type SidebarProps = {
  identifier: string;
};

export type DesktopSidebarState = {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  showForGuests?: boolean;
};
