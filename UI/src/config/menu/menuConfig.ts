import { MenuSection } from "../../types/Menu";
import { UserRole } from "../../types/Users";

export const menuConfig: MenuSection[] = [
  {
    title: "Tableau de bord",
    items: [
      {
        title: "Tableau de bord",
        titlePage: "TDB",
        icon: "fas fa-tachometer-alt", // Icône du dashboard
        to: "/dashboard",
        roles: ["ADMIN", "MANAGER", "USER"],
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Configuration",
        titlePage: "Configuration",
        icon: "fas fa-cogs", // Icône pour configuration
        to: "/configuration",
        roles: ["ADMIN", "MANAGER", "USER"],
      },
    ],
  },
  {
    title: "Gestion Lots",
    items: [
      {
        title: "Gestion Lots",
        titlePage: "Gestion Lots",
        icon: "fas fa-boxes", // Icône pour gestion des lots
        to: "/manage",
        roles: ["ADMIN", "MANAGER", "USER"],
      },
    ],
  },
  {
    title: "Traitement",
    items: [
      {
        title: "Traitement",
        titlePage: "Traitement",
        icon: "fas fa-tasks", // Icône pour le traitement
        to: "/processing/cq",
        roles: ["ADMIN", "MANAGER", "USER"],
      },
    ],
    sidebar: [
      {
        title: "Traitement",
        items: [
          {
            title: "CQ (Contrôle qualité)",
            titlePage: "Contrôle qualité",
            icon: "fas fa-check-circle",
            to: "/processing/cq",
            roles: ["ADMIN", "MANAGER", "USER"],
          },
          {
            title: "Autres traitements",
            titlePage: "Autres traitements",
            icon: "fas fa-cogs",
            to: "/processing/other",
            roles: ["ADMIN", "MANAGER", "USER"],
          },
        ],
      },
    ],
  },
];

// Filtrer le menu selon le rôle
export const getFilteredMenu = (userRoles: UserRole[]): MenuSection[] => {
  const hasAccess = (allowedRoles: UserRole[] | undefined) => {
    if (!allowedRoles || allowedRoles.length === 0) return true; // No roles defined means public
    return userRoles.some(userRole => allowedRoles.includes(userRole));
  };

  return menuConfig
    .filter((section) => hasAccess(section.roles))
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => hasAccess(item.roles))
        .map((item) => ({
          ...item,
          items: item.items
            ? item.items.filter(
                (subItem) => hasAccess(subItem.roles)
              )
            : undefined,
        })),
    }));
};