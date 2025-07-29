import { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
  disabled?: boolean;
  external?: boolean;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}
