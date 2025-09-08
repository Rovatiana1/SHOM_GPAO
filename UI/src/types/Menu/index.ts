import { UserRole } from "../Users";

export interface MenuItem {
  title: string;
  titlePage: string;
  icon: string;
  to?: string;
  items?: MenuItem[] | undefined;
  roles?: UserRole[]; // Optionnel : restrictions par rôle
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
  roles?: UserRole[]; // Optionnel : restrictions par rôle
  sidebar?: MenuSection[]; // Sous-sections pour le sidebar
}