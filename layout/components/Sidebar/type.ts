export interface SidebarLinkType {
  label: string;
  href: string;
  isActive?: boolean;
  isDisabled?: boolean;
  children?: never;
}

export interface SidebarCollapseType {
  label: string;
  href?: never;
  isActive?: boolean;
  isDisabled?: boolean;
  children: SidebarLinkType[];
}

export type SidebarItemType = SidebarLinkType | SidebarCollapseType;
